<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import PocketBase, { type RecordModel } from 'pocketbase';
	import { fly } from 'svelte/transition';
	import { themeChange } from 'theme-change';

	// Define the type of the store
	const activeClubNight: Writable<RecordModel | null> = writable(null);

	let pb: PocketBase;

	let intervalId: string | number | NodeJS.Timeout | undefined;

	onMount(async () => {
		themeChange(false);
		pb = new PocketBase('http://localhost:8090');

		intervalId = setInterval(async () => {
			const initialClubNight = await pb.collection('club_night').getFirstListItem('is_active=true');
			if (initialClubNight) {
				activeClubNight.set(initialClubNight);
			} else {
				console.log('no active club night');
			}
		}, 5000);
	});

	onDestroy(async () => {
		clearInterval(intervalId);
	});
</script>

<div class="flex w-full flex-row flex-wrap p-3">
	<div class="card flex h-20 flex-grow place-items-center rounded-box bg-base-300">
		<p>Current event:</p>
		{#key $activeClubNight}
			{#if $activeClubNight}
				<p in:fly={{ duration: 250, x: 0, y: -20 }}>
					{$activeClubNight.event_name}
				</p>
			{:else}
				<span class="loading loading-dots loading-md"></span>
			{/if}
		{/key}
	</div>
	<div class="divider divider-horizontal"></div>
	<div class="card h-20 flex-grow flex-col place-items-center rounded-box bg-base-300">
		<p>Maximum Guests:</p>
		{#key $activeClubNight}
			{#if $activeClubNight}
				<p in:fly={{ duration: 250, x: 0, y: -20 }}>
					{$activeClubNight.max_guests}
				</p>
			{:else}
				<span class="loading loading-dots loading-md"></span>
			{/if}
		{/key}
	</div>
	<div class="divider divider-horizontal"></div>
	<div class="card h-20 flex-grow flex-col place-items-center rounded-box bg-base-300">
		<p>Current Guests:</p>
		{#key $activeClubNight}
			{#if $activeClubNight}
				<p in:fly={{ duration: 250, x: 0, y: -20 }}>
					{$activeClubNight.current_guests}
				</p>
				<progress
					class="progress w-56"
					value={$activeClubNight.current_guests}
					max={$activeClubNight.max_guests}
				></progress>
			{:else}
				<span class="loading loading-dots loading-md"></span>
			{/if}
		{/key}
	</div>
	<div class="divider divider-horizontal"></div>
	<div
		class="card flex min-h-16 min-w-16 flex-none place-items-center justify-center rounded-box bg-base-300"
	>
		<label class="swap swap-rotate">
			<!-- this hidden checkbox controls the state -->
			<input
				type="checkbox"
				class="theme-controller"
				data-toggle-theme="dark,light"
				data-act-class="ACTIVECLASS"
			/>

			<!-- sun icon -->
			<svg
				class="swap-on h-10 w-10 fill-current"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				><path
					d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
				/></svg
			>

			<!-- moon icon -->
			<svg
				class="swap-off h-10 w-10 fill-current"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				><path
					d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
				/></svg
			>
		</label>
	</div>
</div>
