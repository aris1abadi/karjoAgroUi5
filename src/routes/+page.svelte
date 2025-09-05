<script lang="ts">
	import { onMount } from 'svelte';
	import { loginStart, kirimMsg } from '$lib/mqttClient';
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
		msgType
	} from '$lib/stores';
	import { unixToLocalString } from '$lib/utils';
	import { Button, Checkbox, Modal, Label, Input, Spinner } from 'flowbite-svelte';
	import { ArrowRightOutline, ArrowLeftOutline } from 'flowbite-svelte-icons';
	import RangeSlider from 'svelte-range-slider-pips';

	let viewIndex = $state(0);
	let defaultModal = $state(false);
	let modeSelect = $state(0);
	let namaSelect = $state('');
	let aktuator1Select = $state(0);
	let aktuator2Select = $state(0);
	let sensorSelect = $state(0);
	let sensorSelectList = $state(0);

	let rangeValue = $state([20, 80]);
	let minSpinner = $state(10);
	let maxSpinner = $state(100);
	let satuan = $state('Cm');
	let dummyTask = $state([$myTask[0]]);
	// isTaskEnable = $state(false)

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
			isTaskEnable.set(true);
		} else {
			isTaskEnable.set(false);
		}
		
	}
	function taskInc() {
		if (++viewIndex > $myTask.length - 1) {
			viewIndex = 0;
		}
		//console.log('inc view');
		gantiSatuan(viewIndex);
		if ($myTask[viewIndex].enable === 1) {
			isTaskEnable.set(true);
		} else {
			isTaskEnable.set(false);
		}
	}
	function rangeChange() {
		dummyTask.batasBawah = rangeValue[0];
		dummyTask.batasAtas = rangeValue[1];
	}
	function simpanTask() {
		dummyTask.nama = namaSelect;
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
			minSpinner = -10;
			maxSpinner = 15;
		}
	}

	function loginClick() {
		$loginWait = true;
		setTimeout(() => loginTimeOut(), 10000);
		loginStart();
	}
	function loginTimeOut() {
		if ($loginWait) {
			$loginWait = false;
			alert('kontroller tidak meresponse\nCek koneksi atau kontrollerId');
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
			alert('Kontroller tidak menanggapi !!!');
		}
	}

	function aktuatorClick() {
		if ($myTask[viewIndex].aktuator1Val === 1) {
			kirimMsg(msgType.TASK, viewIndex, 'aktuator', '0');
		} else {
			kirimMsg(msgType.TASK, viewIndex, 'aktuator', '1');
		}
	}
</script>

{#if $isLogin}
	{#if $myTask.length !== 0}
		<div class="grid h-54 w-full justify-items-center rounded-lg bg-white p-0 shadow">
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
			<div class="mt-0 text-xs">lastSeen {unixToLocalString($myTask[viewIndex].lastSeen)}</div>

			<div class="grid h-16 w-3/4 grid-cols-4 border border-blue-300">
				<div class="col-span-3"></div>
				<div class="text-xs font-bold">Pompa</div>
				<div class="col-span-3 ml-4">
					<Checkbox onchange={() => taskChange()} bind:checked={$isTaskEnable}>
						{#if $taskChangeWait}<Spinner class="me-3" bg="white" size="5" color="yellow" />
						{/if}

						auto</Checkbox
					>
				</div>

				<button class="flex justify-items-center" onclick={() =>aktuatorClick()}>
					{#if $myTask[viewIndex].aktuator1Val === 1}
						<img src="/on4.png" alt="On" class="h-8 w-8" />
					{:else}
						<img src="/off4.png" alt="Off" class="h-8 w-8" />
						
					{/if}</button>
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
				class="h-4 w-4">{viewIndex}</Button
			>
			<Button pill={true} class="p-2!" onclick={() => taskInc()}
				><ArrowRightOutline class="h-4 w-4" /></Button
			>
			<div class="col-span-2"></div>
		</div>
	{/if}
{:else}
	<div class="grid h-54 w-full justify-items-center rounded-lg bg-white p-0 shadow">
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
				<button color="blue" class="h-10 w-full rounded-lg border">Local </button>
			</div>
		</div>
	</div>
{/if}

<Modal class="h-full w-full" title={setupTitle} bind:open={defaultModal}>
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
	</div>

	<div class="my-0">
		<label for="pilihSensor" class="mb-1 block text-xs dark:text-white">Pilih Sensor</label>
		<select
			id="pilihSensor"
			bind:value={sensorSelect}
			onchange={() => sensorSelect_click()}
			class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
		>
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
		</select>
	</div>
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
</Modal>
