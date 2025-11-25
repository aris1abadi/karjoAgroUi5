async function fetchAllData(channelId: string, apiKey: string) {
    const LIMIT = 8000;
    let offset = 0;
    let allData: any[] = [];

    while (true) {
        const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&offset=${offset}&results=${LIMIT}&timezone=Asia/Jakarta`;

        // PENTING: pakai globalThis.fetch untuk bypass proxy Vite
        const res = await globalThis.fetch(url);

        const json = await res.json();

        if (!json.feeds || json.feeds.length === 0) break;

        allData.push(...json.feeds);

        if (json.feeds.length < LIMIT) break;

        offset += LIMIT;
    }

    return allData;
}

function convertToCSV(data: any[]) {
    if (data.length === 0) return "";

    const keys = Object.keys(data[0]);
    const header = keys.join(",");
    const rows = data.map(o => keys.map(k => JSON.stringify(o[k] ?? "")).join(","));
    return [header, ...rows].join("\n");
}

export async function GET({ url }) {
    const channelId = url.searchParams.get("channel")!;
    const apiKey = url.searchParams.get("apiKey")!;

    const data = await fetchAllData(channelId, apiKey);

    const csv = convertToCSV(data);

    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="thingspeak-${channelId}-all.csv"`
        }
    });
}
