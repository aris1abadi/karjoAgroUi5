<script lang="ts">
    import { sensorData } from "$lib/stores";
  </script>
  
  <h1 class="text-xl font-bold mb-4">Logger Sensor</h1>
  
  <ul>
    {#each $sensorData as item}
      <li>{item.time} - {item.moisture}%</li>
    {/each}
  </ul>
  
  <!-- TODO: Tambah Chart.js -->
  