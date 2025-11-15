<script>
    import { onMount, onDestroy } from 'svelte';
    
    import { 
        Chart, 
        // Impor semua elemen yang diperlukan:
        LineController, // <-- Tambahkan ini untuk memungkinkan grafik 'line'
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale, // Untuk sumbu Y (numerik)
        PointElement,
        CategoryScale // <--- INI YANG HILANG (Untuk sumbu X non-numerik/waktu)
    } from 'chart.js';

    // WAJIB: Daftarkan semua elemen Chart.js yang diimpor
    Chart.register(
        LineController, // <-- Daftarkan controller-nya
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale
    );

    // Props: data dan options akan datang dari +page.svelte
    // Gunakan $props() untuk mendapatkan semua props
    const { data, options, type = 'line' } = $props();

    let canvasElement; // Digunakan untuk mengikat elemen <canvas>
    let chartInstance = null; // Instance objek Chart.js
// A. INISIALISASI AWAL (Menggantikan $effect.pre inisialisasi)
onMount(() => {
        // SOLUSI KRUSIAL: Buat salinan mendalam non-reaktif
        const nonReactiveData = JSON.parse(JSON.stringify(data));
        
        // Pastikan canvasElement sudah tersedia
        if (canvasElement) {
            chartInstance = new Chart(canvasElement, {
                type,
                data: nonReactiveData,
                options,
            });
        }
    });

    // B. UPDATE BERIKUTNYA (Gunakan $effect.pre TANPA IMPOR)
    // Svelte 5 harus menyediakan $effect secara global di dalam <script>
    $effect.pre(() => {
        // Blok ini akan dijalankan SETELAH onMount pada pemuatan awal,
        // dan setiap kali 'data' atau 'options' berubah.
        
        // Kita hanya perlu melakukan UPDATE jika instance sudah ada:
        if (chartInstance) {
            // SOLUSI KRUSIAL: Buat salinan mendalam non-reaktif untuk pembaruan
            const nonReactiveData = JSON.parse(JSON.stringify(data));
            
            chartInstance.data = nonReactiveData;
            chartInstance.options = options;
            chartInstance.update();
        }
    });


    // C. PENGHANCURAN
    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
    });
</script>

<canvas bind:this={canvasElement}></canvas>