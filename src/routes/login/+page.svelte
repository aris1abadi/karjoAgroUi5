<script lang="ts">
	import mqttClient from "$lib/mqttClient";
    import client from "$lib/mqttClient";
    import { lastCommand } from "$lib/stores";
  
    function kirim(cmd: string) {
      mqttClient.publish("abadinet-in/KA-8CE9/0/0/getAllStatus", cmd);
      lastCommand.set(cmd);
    }
  </script>
  
  <h1 class="text-xl font-bold mb-4">Kontrol Pompa</h1>
  
  <div class="space-x-2 mt-4">
    <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={() => kirim("1")}>
      Hidupkan Pompa
    </button>
    <button class="bg-red-500 text-white px-4 py-2 rounded" on:click={() => kirim("0")}>
      Matikan Pompa
    </button>
  </div>
  
  <p class="mt-4">Perintah terakhir: {$lastCommand}</p>
  