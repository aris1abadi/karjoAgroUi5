<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { HomeOutline } from 'flowbite-svelte-icons';
	import { isMqttConnected, isControllerConnected, isLogin,kontrolID } from '$lib/stores';
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

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="mx-auto w-full max-w-md items-center">
	<div class="mb-0 mt-4 text-center text-2xl text-white font-mono  font-bold">Irigasi Otomatis</div>
	<div class="text-center text-white text-xs">KarjoAgro {$kontrolID}</div>
	<div class="grid-cols-15 mt-2 grid">
		<div class="col-span-5"></div>
		<MobilePhoneSolid class="h-5 w-5 shrink-0 text-center text-white" />
		{#if $isMqttConnected}
			<ArrowsRepeatOutline class="h-4 w-4 shrink-0 text-center" />
			<CloudArrowUpSolid class="h-5 w-5 shrink-0 text-white" />
			{#if $isControllerConnected}
				<ArrowsRepeatOutline class="h-4 w-4 shrink-0" />
				<UploadSolid class="h-5 w-5 shrink-0 text-white" />
			{/if}
		{/if}
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
			<BottomNavItem btnName="Home" href="/">
				<HomeSolid />
			</BottomNavItem>
			<BottomNavItem btnName="Setup" href="/settings">
				<AdjustmentsVerticalOutline />
			</BottomNavItem>
			<BottomNavItem btnName="Keluar" href="/login">
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
