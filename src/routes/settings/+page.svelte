<script lang="ts">
	import client from '$lib/mqttClient';
	import { onMount } from 'svelte';
	import {
		isLogin,
		lastCommand,
		kontrolID,
		myAktuator,
		myTemperatureSensor,
		myHumiditySensor,
		mySoilSensor,
		myDistanceSensor,
		myTask,
		demoVal,
		demoWait
	} from '$lib/stores';
	import { Tabs, TabItem, Button, Toggle, Spinner } from 'flowbite-svelte';

	let inputID = $state('');
	let displaySelect = $state(0);
	let displayModeSelect = $state(0);

	const displatList = ['Mode BAR', 'Mode Angka'];
	let tempConfig = [false, false, false, false, false];
	let humConfig = [false, false, false, false, false];
	let soilConfig = [false, false, false, false, false];
	let distConfig = [false, false, false, false, false];

	function kirim(cmd: string) {
		client.publish('irigasi/control', cmd);
		lastCommand.set(cmd);
	}

	function simpanSetup() {}
	function updateDisplayClick() {}
	function demoChange() {}
</script>

<Tabs tabStyle="underline">
	{#if $isLogin}
		<TabItem open title="Setup">
			<div class="h-80 w-full overflow-auto">
				<!--for setupkontroller network-->
				<div class="mx-auto grid max-w-sm grid-cols-2 gap-4">
					<div class="col-span-2 grid h-12 w-full grid-cols-2 gap-4 rounded border p-2">
						<input
							type="text"
							bind:value={inputID}
							class=" h-8 w-full border-none bg-gray-50 text-sm text-gray-900"
							placeholder={$kontrolID}
							required
						/>
						<Button class="h-8 w-full" color="green" onclick={() => simpanSetup()}>Simpan</Button>
					</div>
					{#if $isLogin}
						<div class="col-span-2 grid h-40 w-full grid-cols-2 gap-4 rounded border p-2">
							<div>
								<label for="disp1" class="mb-1 block text-xs dark:text-white">Display</label>
								<select
									bind:value={displaySelect}
									id="disk1"
									class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
								>
									{#each $myTask as kontrol, idx}
										<option value={idx}>{kontrol.nama}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="disk2" class="mb-1 block text-xs">Mode</label>
								<select
									id="disk2"
									bind:value={displayModeSelect}
									class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
								>
									{#each displatList as display, idx}
										<option value={idx}>{display}</option>
									{/each}
								</select>
							</div>
							<Button onclick={() => updateDisplayClick()} class="col-span-2">Update Display</Button
							>
						</div>
						<div class="center col-span-2 h-12 w-full rounded border px-8 py-2">
							<Toggle bind:checked={$demoVal} onchange={() => demoChange()}
								>Demo
								{#if $demoWait}
									<Spinner class="me-3" bg="white" size="5" color="yellow" />
								{/if}
							</Toggle>
						</div>
					{/if}
				</div>
			</div>
		</TabItem>
		<TabItem title="Aktuator">
			<div class="h-60 w-full overflow-auto">
				{#each $myAktuator as aktuator, idx}
					<div class="mb-4 grid h-16 w-full grid-cols-3 rounded border p-2">
						<button class="textsm col-span-2 ml-2 text-left font-bold"
							>Aktuator{idx + 1}
							<div class="text-xs font-normal">
								NodeId: {aktuator.nodeId} Aktuator: {aktuator.nomerAktuator}
							</div></button
						>
						<button class="text-sm font-bold"
							>{#if aktuator.val === 1}
								ON
							{:else}
								OFF
							{/if}</button
						>
					</div>
				{/each}
			</div>
		</TabItem>
		<TabItem title="Sensor">
			<div class="no-scrollbar h-60 w-full overflow-auto">
				{#each $myTemperatureSensor as sensor, idx}
					<div class="mb-4 grid h-32 w-full grid-cols-3 content-start rounded border">
						<button class="col-span-2 h-14 rounded bg-gray-200 text-left text-sm font-bold"
							><div class="ml-2 mt-2 font-bold">SensorTemperature{idx + 1}</div>
							<div class="ml-2 text-xs font-normal">
								NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
							</div></button
						>
						<button class="bg-gray-200 text-center font-bold">{sensor.val}%</button>

						<div class="ml-2 mt-2 text-xs">Snr:{sensor.snr}</div>
						<div class="mt-2 text-xs">Rssi:{sensor.rssi}</div>
						<div class="mt-2 text-xs">val:{sensor.rawVal}</div>

						<div class="col-span-3 my-2 ml-2 text-xs">
							lastSeen:{sensor.lastSeen}
						</div>
					</div>
				{/each}
				<hr class="mb-4" />
				{#each $myHumiditySensor as sensor, idx}
					<div
						class='mb-4 grid h-32 w-full grid-cols-3 content-start rounded border'
					>
						<button
							
							class='col-span-2 h-14 rounded bg-gray-200 text-left text-sm font-bold'
								
							><div class="ml-2 mt-2 font-bold">SensorHumidity{idx + 1}</div>
							<div class="ml-2 text-xs font-normal">
								NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
							</div></button
						>
						<button
							class='bg-gray-200 text-center font-bold'
								>{sensor.val}%</button
						>
						
							<div class="ml-2 mt-2 text-xs font-normal">Snr:{sensor.snr}</div>
							<div class="mt-2 text-xs font-normal">Rssi:{sensor.rssi}</div>
							<div class="mt-2 text-xs font-normal">val:{sensor.rawVal}</div>

							<div class="col-span-3 my-2 ml-2 text-xs font-normal">
								lastSeen:{sensor.lastSeen}
							</div>
						
					</div>
				{/each}
				<hr class="mb-4" />
				{#each $mySoilSensor as sensor, idx}
					<div
						class='mb-4 grid h-32 w-full grid-cols-3 content-start rounded border'
					>
						<button
							
							class='col-span-2 h-14 rounded bg-gray-200 text-left text-sm font-bold'
								
							><div class="ml-2 mt-2 font-bold">SensorLengas{idx + 1}</div>
							<div class="ml-2 text-xs font-normal">
								NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
							</div></button
						>
						<button
							class='bg-gray-200 text-center font-bold'
								>{sensor.val}%</button
						>
						
							<div class="ml-2 text-xs font-normal">Snr:{sensor.snr}</div>
							<div class="text-xs font-normal">Rssi:{sensor.rssi}</div>
							<div class=" text-xs font-normal">val:{sensor.rawVal}</div>

							<div class="ml-2 text-xs font-normal">minVal:{sensor.minValue}</div>
							<div class="text-xs font-normal">maxVal:{sensor.maxValue}</div>
							<div></div>

							<div class="col-span-3 ml-2 text-xs font-normal">
								lastSeen:{sensor.lastSeen}
							</div>
						
					</div>
				{/each}
				<hr class="mb-4" />
				{#each $myDistanceSensor as sensor, idx}
					<div
						class='h-34 mb-4 grid w-full grid-cols-3 content-start rounded border'
							
					>
						<button
							
							class='col-span-2 h-14 rounded bg-gray-200 text-left text-sm font-bold'
								
							><div class="ml-2 mt-2 font-bold">SensorIntermittent{idx + 1}</div>
							<div class="ml-2 text-xs font-normal">
								NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
							</div></button
						>
						<button
							class='bg-gray-200 text-center font-bold'>{sensor.val} cm</button
						>
						
							<div class="ml-2 text-xs font-normal">Snr:{sensor.snr}</div>
							<div class="text-xs font-normal">Rssi:{sensor.rssi}</div>
							<div class=" text-xs font-normal">val:{sensor.rawVal}</div>

							<div class="ml-2 text-xs font-normal">minVal:{sensor.minValue}</div>
							<div class="text-xs font-normal">maxVal:{sensor.maxValue}</div>
							<div></div>

							<div class="col-span-3 ml-2 text-xs font-normal">
								lastSeen:{sensor.lastSeen}
							</div>
						
					</div>
				{/each}
				<hr class="mb-4" />
			</div>
		</TabItem>
	{:else}
		<TabItem open title="Setup">
			<div class="h-60 w-full overflow-auto">
				<!--for setupkontroller network-->
				<div class="mx-auto grid max-w-sm grid-cols-2 gap-4">
					<input
						type="text"
						bind:value={inputID}
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder={$kontrolID}
						required
					/>
					<Button color="green" onclick={() => simpanSetup()}>Simpan</Button>
					<div class="col-span-2"></div>
					{#if $isLogin}
						<Toggle bind:checked={$demoVal} onchange={() => demoChange()}
							>Demo
							{#if $demoWait}
								<Spinner class="me-3 ml-2" bg="white" size="5" color="yellow" />
							{/if}
						</Toggle>
					{/if}
				</div>
			</div>
		</TabItem>
	{/if}
</Tabs>

<p class="mt-4">Perintah terakhir: {$lastCommand}</p>
