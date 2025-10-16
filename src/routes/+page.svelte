<script lang="ts">
	import { onMount } from 'svelte';
	import { loginStart, kirimMsg, mqttDisconnect } from '$lib/mqttClient';
	import QRCode from 'qrcode';
	import {
		taskMode,
		myTask,
		myAktuator,
		taskModeTxt,
		myTemperatureSensor,
		myHumiditySensor,
		mySoilSensor,
		myDistanceSensor,
		isLogin,
		loginWait,
		isTaskEnable,
		isMqttConnected,
		taskChangeWait,
		msgType,
		logMsg,
		connectionType,
		connectionMode,
		settingModal,
		kontrolID,
		isBleConnected,
		demoVal,
		demoWait,
		settingTitle,
		isDemo,
		logHistory
	} from '$lib/stores';
	import { unixToLocalString } from '$lib/utils';
	import {
		Button,
		Checkbox,
		Modal,
		Label,
		Input,
		Spinner,
		Toast,
		Tabs,
		TabItem,
		Toggle,
		Select
	} from 'flowbite-svelte';
	import {
		ArrowRightOutline,
		ArrowLeftOutline,
		AngleLeftOutline,
		AngleRightOutline,
		RefreshOutline,
		TrashBinSolid
	} from 'flowbite-svelte-icons';
	import RangeSlider from 'svelte-range-slider-pips';
	import { bleConnect, bleDisconnect } from '$lib/bleClient';
	import { goto } from '$app/navigation';
	import { notifier } from '@beyonk/svelte-notifications';

	let viewIndex = $state(0);
	let defaultModal = $state(false);
	let modeSelect = $state(0);
	let namaSelect = $state('');
	let aktuator1Select = $state(0);
	let aktuator2Select = $state(0);
	let sensorSelect = $state(0);
	let sensorSelectList = $state(0);

	const channelList = [
		{ value: 0, name: 'CH1 920Mhz' },
		{ value: 1, name: 'CH2 921Mhz' },
		{ value: 2, name: 'CH3 922Mhz' },
		{ value: 3, name: 'CH4 923Mhz' },
		{ value: 4, name: 'CH5 925Mhz' }
	];

	let channelSelected = $state(0);

	const intervalList = [
		{ value: 5, name: '5 Menit' },
		{ value: 10, name: '10 Menit' },
		{ value: 15, name: '15 Menit' },
		{ value: 30, name: '30 Menit' },
		{ value: 40, name: '40 Menit' },
		{ value: 50, name: '50 Menit' },
		{ value: 60, name: '60 Menit' }
	];
	let intervalSelected = $state(5);

	let rangeValue = $state([20, 80]);
	let minSpinner = $state(10);
	let maxSpinner = $state(100);
	let satuan = $state('Cm');
	let dummyTask = $state([$myTask[0]]);
	// isTaskEnable = $state(false)

	let inputID = $state('');
	let displaySelect = $state(0);
	let displayModeSelect = $state(0);

	let lastDemo = $isDemo;

	//let settingTitle = $state("Settings")

	let wifiSSID = $state('');
	let wifiPASS = $state('');

	const displatList = ['Mode BAR', 'Mode Angka'];
	let tempConfig = [false, false, false, false, false];
	let humConfig = [false, false, false, false, false];
	let soilConfig = [false, false, false, false, false];
	let distConfig = [false, false, false, false, false];

	let setupTitle = $state('setup ');
	//let loginWait = false
	onMount(() => {});

	function gantiSatuan(idx) {
		if ($myTask[idx].mode === $taskMode[0]) {
			satuan = '°C';
		} else if ($myTask[idx].mode === $taskMode[1]) {
			satuan = '%';
		} else if ($myTask[idx].mode === $taskMode[2]) {
			satuan = '%';
		} else if ($myTask[idx].mode === $taskMode[3]) {
			satuan = 'Cm';
		} else if ($myTask[idx].mode === $taskMode[4]) {
			satuan = '-';
		}
	}
	function taskDec() {
		if (--viewIndex < 0) {
			viewIndex = $myTask.length - 1;
		}
		//console.log('dec view');
		gantiSatuan(viewIndex);
		//update enable status
		if ($myTask[viewIndex].enable === 1) {
			$isTaskEnable = true;
		} else {
			$isTaskEnable = false;
		}
	}
	function taskInc() {
		if (++viewIndex > $myTask.length - 1) {
			viewIndex = 0;
		}
		//console.log('inc view');
		gantiSatuan(viewIndex);
		if ($myTask[viewIndex].enable === 1) {
			$isTaskEnable = true;
		} else {
			$isTaskEnable = false;
		}
	}
	function rangeChange() {
		dummyTask.batasBawah = rangeValue[0];
		dummyTask.batasAtas = rangeValue[1];
	}

	function simpanTask() {
		dummyTask.sensorInterval = intervalSelected;
		dummyTask.nama = namaSelect;
		dummyTask.mode = modeSelect;
		console.log($state.snapshot(dummyTask));
		kirimMsg(msgType.TASK, viewIndex, 'updateTask', JSON.stringify(dummyTask));
		defaultModal = false;
	}

	function modeSelect_click() {
		sensorSelectList = modeSelect;

		if (modeSelect === $taskMode[0]) {
			sensorSelect = $myTask[viewIndex].sensorUse - 1;
			rangeValue[0] = 30;
			rangeValue[1] = 35;

			minSpinner = 10;
			maxSpinner = 100;
		} else if (modeSelect === $taskMode[1]) {
			sensorSelect = $myTask[viewIndex].sensorUse - 1;
			rangeValue[0] = 70;
			rangeValue[1] = 73;
			minSpinner = 10;
			maxSpinner = 100;
		} else if (modeSelect === $taskMode[2]) {
			sensorSelect = $myTask[viewIndex].sensorUse - 1;
			rangeValue[0] = 80;
			rangeValue[1] = 85;
			minSpinner = 10;
			maxSpinner = 100;
		} else if (modeSelect === $taskMode[3]) {
			sensorSelect = $myTask[viewIndex].sensorUse - 1;
			rangeValue[0] = -1;
			rangeValue[1] = 5;
			minSpinner = -10;
			maxSpinner = 15;
		}
		dummyTask.batasBawah = rangeValue[0];
		dummyTask.batasAtas = rangeValue[1];
	}
	function aktuatorSelect_click(num) {
		if (num === 1) {
			dummyTask.aktuator1 = aktuator1Select + 1;
		} else if (num === 2) {
			dummyTask.aktuator2 = aktuator2Select + 1;
		}
	}
	function sensorSelect_click() {
		dummyTask.sensorUse = sensorSelect + 1;
	}

	function setupClick() {
		defaultModal = true;
		dummyTask = $myTask[viewIndex];
		setupTitle = 'Setup ' + $myTask[viewIndex].nama;
		modeSelect = $myTask[viewIndex].mode;
		namaSelect = $myTask[viewIndex].nama;
		sensorSelectList = $myTask[viewIndex].mode;
		intervalSelected = $myTask[viewIndex].sensorInterval;
		aktuator1Select = $myTask[viewIndex].aktuator1 - 1;
		aktuator2Select = $myTask[viewIndex].aktuator2 - 1;
		rangeValue[0] = $myTask[viewIndex].batasBawah;
		rangeValue[1] = $myTask[viewIndex].batasAtas;
		//set

		// sensorList = sensorTemperatureList
		if ($myTask[viewIndex].mode === $taskMode[0]) {
			sensorSelect = $myTask[viewIndex].sensorUse - 1;
			minSpinner = 10;
			maxSpinner = 100;
		} else if ($myTask[viewIndex].mode === $taskMode[1]) {
			sensorSelect = $myTask[viewIndex].sensorUse - 1;
			minSpinner = 10;
			maxSpinner = 100;
		} else if ($myTask[viewIndex].mode === $taskMode[2]) {
			sensorSelect = $myTask[viewIndex].sensorUse - 1;
			minSpinner = 10;
			maxSpinner = 100;
		} else if ($myTask[viewIndex].mode === $taskMode[3]) {
			sensorSelect = $myTask[viewIndex].sensorUse - 1;
			minSpinner = -15;
			maxSpinner = 10;
		}
	}

	function loginClick() {
		$loginWait = true;
		setTimeout(() => loginTimeOut(), 10000);
		loginStart('demoPass', connectionType.MQTT);
	}
	function loginTimeOut() {
		if ($loginWait) {
			$loginWait = false;
			//alert('kontroller tidak meresponse\nCek koneksi atau kontrollerId');
			notifier.warning('kontroller tidak meresponse\nCek koneksi atau kontrollerId');
			if ($connectionMode === connectionType.MQTT) {
				mqttDisconnect();
				$connectionMode = connectionType.NONE;
			} else if ($connectionMode === connectionType.BLE) {
				bleDisconnect();
				$connectionMode = connectionType.NONE;
			}
		}
	}
	function taskChange() {
		$taskChangeWait = true;
		setTimeout(() => taskChangeTimeout(), 10000);
		let enMsg = '0';
		if ($isTaskEnable) {
			enMsg = '1';
		} else {
			enMsg = '0';
		}
		kirimMsg(msgType.TASK, viewIndex, 'enable', enMsg);
		console.log('task change');
	}

	function taskChangeTimeout() {
		if ($taskChangeWait) {
			$taskChangeWait = false;
			//alert('Kontroller tidak menanggapi !!!');
			notifier.warning('Kontroller tidak Terhubung !!!');
		}
	}

	function aktuatorClick() {
		if ($myTask[viewIndex].aktuator1Val === 1) {
			kirimMsg(msgType.TASK, viewIndex, 'aktuator', '0');
		} else {
			kirimMsg(msgType.TASK, viewIndex, 'aktuator', '1');
		}
	}

	function localLogin() {
		//bleConnect()
		loginStart('demoPass', connectionType.BLE);
	}

	function simpanKontrolID() {
		$kontrolID = inputID;
		$settingModal = false;
	}

	function simpanSetup() {}
	function updateDisplayClick() {
		if (displaySelect > $myTask.length) {
			alert('kontrol tidak ditemukan');
		} else {
			let display_msg = String(displaySelect) + ',' + String(displayModeSelect) + '30,80,-,';
			kirimMsg(msgType.KONTROL, 0, 'setDisplay', display_msg);
			console.log('update display ' + display_msg);
		}
	}
	function demoChange() {
		$demoWait = true;
		setTimeout(() => {
			$demoWait = false;
			$demoVal = lastDemo;
		}, 5000);

		let demomsg = '0';
		if ($demoVal) {
			demomsg = '1';
			lastDemo = true;
		} else {
			lastDemo = false;
		}
		kirimMsg(msgType.KONTROL, 0, 'demoMode', demomsg);
	}

	function setKontroIdClick() {
		$settingModal = true;
		$settingTitle = 'Set kontrolID';
	}

	function channelChange() {
		alert('chanel Noe: ' + channelList[channelSelected].name);
	}

	function refreshHistoryClick() {
		kirimMsg(msgType.TASK, viewIndex, 'getHistory', '0');
	}
	function clearHistoryClick() {
		kirimMsg(msgType.TASK, viewIndex, 'clearHistory', '0');
	}
</script>

{#if $isLogin}
	{#if $myTask.length !== 0}
		<div class="h-54 grid w-full justify-items-center rounded-lg bg-white p-0 shadow">
			<button
				class={$myTask[viewIndex].enable === 0
					? 'font-monospace mt-0 h-8 w-full  bg-red-500 text-center text-sm font-bold text-white '
					: 'font-monospace mt-0 h-8 w-full  bg-green-500 text-center text-sm font-bold text-white '}
				ondblclick={() => setupClick()}
			>
				{$myTask[viewIndex].nama}
			</button>
			<div class="mb-0 text-4xl font-bold">
				{$myTask[viewIndex].sensorVal} <span class="text-xl">{satuan}</span>
			</div>
			<div class="mt-0 text-xs">
				lastSeen
				{#if $myTask[viewIndex].lastSeen === 0}
					---
				{:else}
					{unixToLocalString($myTask[viewIndex].lastSeen)}
				{/if}
			</div>

			<div class="grid h-16 w-5/6 grid-cols-4 border border-blue-300">
				<div class="col-span-3"></div>
				<div class="text-xs font-bold">Pompa</div>
				<div class="col-span-3 ml-4 text-xs">
					<Checkbox onchange={() => taskChange()} bind:checked={$isTaskEnable}>
						{#if $taskChangeWait}<Spinner class="me-3" bg="white" size="5" color="yellow" />
						{/if}
						<span class="font-mono text-xs font-bold">
							Auto ON {$myTask[viewIndex].batasBawah} & OFF {$myTask[viewIndex].batasAtas}
						</span>
					</Checkbox>
				</div>

				<button class="flex justify-items-center" onclick={() => aktuatorClick()}>
					{#if $myTask[viewIndex].aktuator1Val === 1}
						<img src="on4a.png" alt="On" class="h-8 w-8" />
					{:else}
						<img src="off4a.png" alt="Off" class="h-8 w-8" />
					{/if}</button
				>
			</div>
		</div>
		<div class="mt-8 grid grid-cols-7 items-center gap-2">
			<div class="col-span-2"></div>
			<Button pill={true} class="p-2!" color="blue" onclick={() => taskDec()}
				><ArrowLeftOutline class="h-4 w-4" /></Button
			>
			<Button
				pill={true}
				outline={true}
				onclick={() => {
					viewIndex = 0;
				}}
				class="h-4 w-4">{viewIndex + 1}</Button
			>
			<Button pill={true} class="p-2!" onclick={() => taskInc()}
				><ArrowRightOutline class="h-4 w-4" /></Button
			>
			<div class="col-span-2"></div>
		</div>
	{/if}
{:else}
	<div class="h-54 grid w-full justify-items-center rounded-lg bg-white p-0 shadow">
		<div class="p-4">
			<Label for="password">Password</Label>
			<Input type="password" id="password" class="h-10" placeholder="•••••••••" required />
			<div class="mt-4 grid grid-cols-3 gap-4">
				<button
					onclick={() => loginClick()}
					color="blue"
					class="col-span-2 h-10 w-full rounded-lg border border-blue-700 bg-blue-600 text-white"
				>
					{#if $loginWait}
						<Spinner class="me-3" bg="white" size="5" color="yellow" />
					{/if}Login
				</button>
				<button color="blue" class="h-10 w-full rounded-lg border" onclick={() => localLogin()}
					>Local
				</button>
				<button
					onclick={() => setKontroIdClick()}
					class="col-span-3 text-right text-sm text-blue-800">Set kontrollerId</button
				>
			</div>
		</div>
	</div>
{/if}

<!--
<div>{$logMsg}</div>

-->

<Modal class="h-180 w-full py-0" title={setupTitle} bind:open={defaultModal}>
	<Tabs tabStyle="underline">
		<TabItem open title="Setup">
			<div class="mx-auto grid max-w-sm grid-cols-2 gap-2">
				<div class="col-span-2">
					<label for="pilihMode" class="mb-1 block text-xs dark:text-white">Pilih Mode</label>
					<select
						id="pilihMode"
						bind:value={modeSelect}
						onchange={() => modeSelect_click()}
						class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					>
						{#each $taskModeTxt as mode, idx}
							<option value={idx}>{mode}</option>
						{/each}
					</select>
				</div>

				<div class="col-span-2">
					<label for="NamaTask" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
						>Nama</label
					>
					<input
						type="text"
						id="namatask"
						bind:value={namaSelect}
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder={$myTask[viewIndex].nama}
						required
					/>
				</div>

				<div>
					<label for="small1" class="mb-1 block text-xs dark:text-white">Pilih Aktuator1</label>
					<select
						bind:value={aktuator1Select}
						onchange={() => aktuatorSelect_click(1)}
						id="small1"
						class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					>
						{#each $myAktuator as aktuator, idx}
							<option value={idx}>Aktuator({aktuator.nodeId}-{aktuator.nomerAktuator})</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="small2" class="mb-1 block text-xs">Pilih Aktuator2</label>
					<select
						bind:value={aktuator2Select}
						onchange={() => aktuatorSelect_click(2)}
						id="small2"
						class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					>
						{#each $myAktuator as aktuator, idx}
							<option value={idx}>Aktuator({aktuator.nodeId}-{aktuator.nomerAktuator})</option>
						{/each}
					</select>
				</div>
				<Label class="text-xs"
					>Pilih Sensor
					<Select bind:value={sensorSelect} onchange={() => sensorSelect_click()} class="text-sm">
						{#if sensorSelectList === $taskMode[0]}
							{#each $myTemperatureSensor as sensor, idx}
								<option value={idx}>Sensor Temperature {idx + 1} ({sensor.nodeId}) </option>
							{/each}
						{:else if sensorSelectList === $taskMode[1]}
							{#each $myHumiditySensor as sensor, idx}
								<option value={idx}>Sensor Humidity {idx + 1} ({sensor.nodeId}) </option>
							{/each}
						{:else if sensorSelectList === $taskMode[2]}
							{#each $mySoilSensor as sensor, idx}
								<option value={idx}>Sensor Lengas {idx + 1} ({sensor.nodeId}) </option>
							{/each}
						{:else if sensorSelectList === $taskMode[3]}
							{#each $myDistanceSensor as sensor, idx}
								<option value={idx}>Sensor Air {idx + 1} ({sensor.nodeId}) </option>
							{/each}
						{:else if sensorSelectList === $taskMode[4]}
							<option value={0}>---</option>
						{/if}
					</Select>
				</Label>

				<Label class="text-xs"
					>Sensor Interval {intervalSelected} Menit
					<RangeSlider min={5} max={60} bind:value={intervalSelected} />
				</Label>
			</div>

			<div class="my-0"></div>
			<div class="mt-2 rounded-sm border border-gray-200 dark:border-gray-700">
				<div class="mt-2 grid grid-cols-2 justify-items-center">
					{#if $myTask[viewIndex].mode === $taskMode[0]}
						<div>OFF({rangeValue[0]})</div>
						<div>ON({rangeValue[1]})</div>
					{:else}
						<div>ON({rangeValue[0]})</div>
						<div>OFF({rangeValue[1]})</div>
					{/if}
				</div>

				<RangeSlider
					range
					pips
					min={minSpinner}
					max={maxSpinner}
					onchange={() => rangeChange()}
					bind:values={rangeValue}
				/>
			</div>

			<div class="grid h-10 w-3/4 grid-cols-3 gap-4 pl-4">
				<Button color="red" onclick={() => (defaultModal = false)}>Keluar</Button>
				<Button color="green" onclick={() => simpanTask()}>Simpan</Button>
			</div>
		</TabItem>
		<TabItem title="Aktuator">
			<div class="h-full w-full overflow-auto">
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
			<div class="no-scrollbar h-full w-full overflow-auto">
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
					<div class="mb-4 grid h-32 w-full grid-cols-3 content-start rounded border">
						<button class="col-span-2 h-14 rounded bg-gray-200 text-left text-sm font-bold"
							><div class="ml-2 mt-2 font-bold">SensorHumidity{idx + 1}</div>
							<div class="ml-2 text-xs font-normal">
								NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
							</div></button
						>
						<button class="bg-gray-200 text-center font-bold">{sensor.val}%</button>

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
					<div class="mb-4 grid h-32 w-full grid-cols-3 content-start rounded border">
						<button class="col-span-2 h-14 rounded bg-gray-200 text-left text-sm font-bold"
							><div class="ml-2 mt-2 font-bold">SensorLengas{idx + 1}</div>
							<div class="ml-2 text-xs font-normal">
								NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
							</div></button
						>
						<button class="bg-gray-200 text-center font-bold">{sensor.val}%</button>

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
					<div class="h-34 mb-4 grid w-full grid-cols-3 content-start rounded border">
						<button class="col-span-2 h-14 rounded bg-gray-200 text-left text-sm font-bold"
							><div class="ml-2 mt-2 font-bold">SensorIntermittent{idx + 1}</div>
							<div class="ml-2 text-xs font-normal">
								NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
							</div></button
						>
						<button class="bg-gray-200 text-center font-bold">{sensor.val} cm</button>

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
		<TabItem title="History">
			<div class="grid grid-cols-2">
				<button onclick={() => refreshHistoryClick()}
					><RefreshOutline class="h-6 w-6 shrink-0" /></button
				>
				<button onclick={() => clearHistoryClick()}><TrashBinSolid /></button>
			</div>
			<div class="no-scrollbar mt-4 h-full w-full overflow-auto text-xs">
				{#if $logHistory}
				{#each $logHistory as history,idx }
					<div>{idx + 1}.{history}</div>
				{/each}
				{:else}
				History tidak ditemukan....
				{/if}
				
			</div>
		</TabItem>
	</Tabs>
</Modal>

<!--Setiing modal-->
<Modal class="max-h-120 w-screen" title={$settingTitle} bind:open={$settingModal}>
	{#if $isLogin}
		<div class="max-h-80 w-full overflow-auto">
			<div class="mx-auto grid w-full grid-cols-2 gap-4">
				<!--for setupkontroller network-->
				{#if $isBleConnected}
					<div class="col-span-2 grid h-36 w-full grid-cols-2 gap-4 rounded border p-2">
						<div>
							<label for="ssid" class="mb-1 block text-xs dark:text-white">ssid</label>

							<input
								id="ssid"
								type="text"
								bind:value={wifiSSID}
								class=" h-8 w-full rounded border bg-gray-50 text-sm text-gray-900"
								placeholder="wifi SSID"
								required
							/>
						</div>
						<div>
							<label for="pass" class="mb-1 block text-xs dark:text-white">password</label>

							<input
								id="pass"
								type="password"
								bind:value={wifiPASS}
								class=" h-8 w-full rounded border bg-gray-50 text-sm text-gray-900"
								placeholder="......"
								required
							/>
						</div>
						<Button class="col-span-2 h-8 w-full" color="green" onclick={() => simpanNetwork()}
							>Simpan</Button
						>
					</div>
					<div class="col-span-2">
						<Label>
							Pilih Channel
							<Select
								items={channelList}
								bind:value={channelSelected}
								onchange={() => {
									channelChange();
								}}
							/>
						</Label>
					</div>
				{/if}

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
					<Button onclick={() => updateDisplayClick()} class="col-span-2 h-10"
						>Update Display</Button
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
			</div>
		</div>
	{:else}
		<div class="mx-auto grid max-w-sm grid-cols-2 gap-4">
			<input
				type="text"
				bind:value={inputID}
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
				placeholder={$kontrolID}
				required
			/>
			<Button color="green" onclick={() => simpanKontrolID()}>Simpan</Button>
			<div class="col-span-2"></div>
		</div>
	{/if}
</Modal>
