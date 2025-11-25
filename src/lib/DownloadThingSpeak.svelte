<script lang="ts">
    export let channelId: string;
    export let apiKey: string;

    let startDate = "";
    let endDate = "";
    let selectedField = "all";

    let loading = false;
    let progress = 0;
    let statusText = "";

    const FIELDS = [
        { key: "all", label: "Semua Sensor" },
        { key: "field1", label: "sensor intemittent" },
        { key: "field2", label: "sensorLengas" },
        { key: "field3", label: "Batteray" }
        
    ];

    function buildUrl(channelId: string, apiKey: string, offset: number, limit: number) {
        let url =
            `https://api.thingspeak.com/channels/${channelId}/feeds.json` +
            `?api_key=${apiKey}&results=${limit}&offset=${offset}` +
            `&timezone=Asia/Jakarta`;

        if (startDate) url += `&start=${startDate}`;
        if (endDate) url += `&end=${endDate}`;

        return url;
    }

    async function fetchAllData() {
        const LIMIT = 8000;
        let offset = 0;
        let allData: any[] = [];

        loading = true;
        progress = 0;
        statusText = "Mengambil data...";

        while (true) {
            const url = buildUrl(channelId, apiKey, offset, LIMIT);
            const res = await fetch(url);
            const json = await res.json();

            if (!json.feeds || json.feeds.length === 0) break;

            // filter field jika user memilih specific field
            let feeds = json.feeds;
            if (selectedField !== "all") {
                feeds = feeds.map(f => ({
                    created_at: f.created_at,
                    entry_id: f.entry_id,
                    [selectedField]: f[selectedField]
                }));
            }

            allData = [...allData, ...feeds];

            progress += feeds.length;
            statusText = `Mengambil... total ${progress} data`;

            if (json.feeds.length < LIMIT) break;
            offset += LIMIT;
        }

        loading = false;
        statusText = `Selesai (${allData.length} data)`;
        return allData;
    }

    function convertToCSV(data: any[]) {
        if (data.length === 0) return "";

        const keys = Object.keys(data[0]);
        const header = keys.join(",");

        const rows = data.map(o =>
            keys.map(k => JSON.stringify(o[k] ?? "")).join(",")
        );

        return [header, ...rows].join("\n");
    }

    async function downloadCSV() {
        progress = 0;
        statusText = "";

        const data = await fetchAllData();
        const csv = convertToCSV(data);

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;

        let name = `thingspeak-${channelId}`;
        if (startDate) name += `-${startDate}`;
        if (endDate) name += `-${endDate}`;
        if (selectedField !== "all") name += `-${selectedField}`;
        name += ".csv";

        a.download = name;
        a.click();

        URL.revokeObjectURL(url);
    }
</script>

<style>
    .progress {
        height: 10px;
        background: #ddd;
        border-radius: 4px;
        margin-top: 10px;
    }

    .bar {
        height: 100%;
        background: #4caf50;
        width: 0%;
        border-radius: 4px;
        transition: width 0.2s ease;
    }

    .spinner {
        border: 4px solid #ddd;
        border-top: 4px solid #4caf50;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        animation: spin 1s linear infinite;
        margin-right: 10px;
        display: inline-block;
    }

    @keyframes spin {
        from { transform: rotate(0); }
        to { transform: rotate(360deg); }
    }
</style>


<div class="w-full px-8 py-4 border rounded-sm mt-4">
    <div>
        <label class="text-xs font-bold" for="start_select">Tanggal Awal:</label><br />
        <input class="h-8 rounded-sm" id="start_select" type="datetime-local" bind:value={startDate} />
    </div>

    <div>
        <label class="text-xs font-bold" for="end_select">Sampai:</label><br />
        <input class="h-8 rounded-sm" id="end_select" type="datetime-local" bind:value={endDate} />
    </div>

    <div>
        <label class="text-xs font-bold" for="pilih_field">Pilih Sensor:</label><br />
        <select class="h-10 rounded-sm" id="pilih_field" bind:value={selectedField}>
            {#each FIELDS as f}
                <option value={f.key}>{f.label}</option>
            {/each}
        </select>
    </div>


<button class="mt-4 text-blue-700" on:click={downloadCSV} disabled={loading}>
    {loading ? "Mengambil Data..." : "Download CSV"}
</button>

{#if loading}
    <div style="margin-top: 10px; display: flex; align-items: center;">
        <div class="spinner"></div>
        <div>{statusText}</div>
    </div>

    <div class="progress">
        <div class="bar" style="width: {progress / 10}px;"></div>
    </div>
{:else if statusText}
    <p>{statusText}</p>
{/if}

</div>
