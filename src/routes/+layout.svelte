<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { get } from 'svelte/store';
	import { HomeOutline } from 'flowbite-svelte-icons';
	import { isMqttConnected, isControllerConnected, isLogin,kontrolID ,settingTitle, connectionMode, connectionType,settingModal, isBleConnected} from '$lib/stores';
	import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from 'flowbite-svelte';
	import {
		HomeSolid,
		AdjustmentsVerticalOutline,
		ForwardSolid,
		MobilePhoneSolid,
		CloudArrowUpSolid,
		UploadSolid,
		ArrowsRepeatOutline
	} from 'flowbite-svelte-icons';
	import { mqttDisconnect } from '$lib/mqttClient';
	import { bleDisconnect } from '$lib/bleClient';
	import { goto } from '$app/navigation';
	import { NotificationDisplay, notifier } from '@beyonk/svelte-notifications'

	let { children } = $props();

	function logoutClick(){
		
		notifier.info('logout')

		if(get(connectionMode) === connectionType.MQTT){
			mqttDisconnect();
			$connectionMode = connectionType.NONE;
		}
		else if(get(connectionMode) === connectionType.BLE){
			bleDisconnect();
			$connectionMode = connectionType.NONE;
		}
		setTimeout(() => goHome(),10000);
		
		
		
		
	}

	function goHome(){
		//goto('/');
		$isLogin = false
	}

	function settingClick(){
		$settingModal = true
		$settingTitle = 'Settings'
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<NotificationDisplay />

<div class="mx-auto w-full max-w-md items-center">
	<div class="mb-0 mt-4 text-center text-2xl text-white font-mono  font-bold">Kontrol Irigasi</div>
	<div class="text-center text-white text-xs">KarjoAgro {$kontrolID}</div>
	<div class="grid grid-cols-3 gap-4">
		<div></div>
	<div class="w-full text-center text-white flex items-center gap-2">
		
		<MobilePhoneSolid class="h-5 w-5 shrink-0 text-center text-white" />
		{#if $isMqttConnected}
			<ArrowsRepeatOutline class="h-4 w-4 shrink-0 text-center" />
			<CloudArrowUpSolid class="h-5 w-5 shrink-0 text-white" />	
		{/if}
		{#if $isControllerConnected}
		<ArrowsRepeatOutline class="h-4 w-4 shrink-0" />
		<UploadSolid class="h-5 w-5 shrink-0 text-white" />
	{/if}
	</div>
	</div>

	<main class="flex-1 p-4">
		{@render children?.()}
		<!-- ini sama dengan <slot /> -->
	</main>
	{#if $isLogin}
		<BottomNav
			position="absolute"
			classes={{ inner: 'grid-cols-3' }}
			style="background-color: rgba(255, 255, 255, 0.4);"
		>
			<div></div>
			<BottomNavItem btnName="Setup" onclick={settingClick}>
				<AdjustmentsVerticalOutline />
			</BottomNavItem>
			<BottomNavItem btnName="Keluar" onclick={logoutClick}>
				<ForwardSolid />
			</BottomNavItem>
		</BottomNav>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss";
	:global(html) {
		width: 100%; /* Lebar elemen 100% dari lebar kontainer */
		height: 100%; /* Tinggi elemen */
		background-image: url('/tumbuh1.jpeg'); /* URL gambar */
		background-size: cover; /* Sesuaikan gambar agar menutupi elemen */
		background-position: center; /* Pusatkan gambar */

		background-repeat: no-repeat; /* Jangan ulangi gambar */
	}
</style>
