export function formatTime(date: Date): string {
	return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function unixToLocalString(timestamp) {
	const dateUTC = new Date(timestamp * 1000);

	// Format tanggal dan waktu saja

	return dateUTC.toISOString().replace('T', ' ').replace(/\..+/, '');
}