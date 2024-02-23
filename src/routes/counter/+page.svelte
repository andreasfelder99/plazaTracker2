<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import PocketBase, { type RecordModel } from 'pocketbase';
	import ThemeSwitcher from '../../components/ThemeSwitcher.svelte';

	// Define the store for the active club night
	const activeClubNight = writable<RecordModel | null>(null);

	// Initialize variables
	let pb: PocketBase;
	let subscription: any;
	let localGuestCount: number = 0;
	let isConnected: boolean = false;

	// Function to run when the component mounts
	onMount(async () => {
		// Set the URL based on the environment
		const url = import.meta.env.PROD ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';
		pb = new PocketBase(url);

		// Get the initial club night
		const initialClubNight = await pb.collection('club_night').getFirstListItem('is_active=true');

		// If there's an active club night
		if (initialClubNight) {
			// Set the active club night and local guest count
			activeClubNight.set(initialClubNight);
			localGuestCount = $activeClubNight ? $activeClubNight.current_guests : 0;

			// Subscribe to changes in the club night
			subscription = pb.collection('club_night').subscribe(initialClubNight.id, (e) => {
				isConnected = true;
				if (e.action === 'update') {
					// Update the active club night when there's an update
					activeClubNight.set(e.record);
				}
			});
		} else {
			isConnected = false;
		}

		// Update the local guest count
		localGuestCount = $activeClubNight ? $activeClubNight.current_guests : 0;

		// Update the current guests every 10 seconds
		setInterval(async () => {
			if ($activeClubNight) {
				await pb.collection('club_night').update($activeClubNight.id, {
					current_guests: localGuestCount
				});
				createLogEntry();
			}
		}, 10000);
	});

	// Function to reload the subscription
	const reload = async () => {
		if (subscription) {
			pb.collection('club_night').unsubscribe();
		}

		const clubNight = $activeClubNight;
		if (clubNight) {
			subscription = pb.collection('club_night').subscribe(clubNight.id, (e) => {
				if (e.action === 'update') {
					activeClubNight.set(e.record);
				}
			});
		}
	};

	// Function to increment the local guest count
	const incrementGuests = () => {
		localGuestCount++;
	};

	// Function to decrement the local guest count
	const decrementGuests = () => {
		if (localGuestCount > 0) {
			localGuestCount--;
		}
	};

	// Function to create a log entry
	const createLogEntry = async () => {
		const lastLogEntry = await pb
			.collection('night_data')
			.getFirstListItem('club_night="' + $activeClubNight?.id + '"', {
				sort: '-created'
			});
		const now = Date.now();

		// Check if the last log entry was created more than 30 seconds ago
		if (!lastLogEntry || now - new Date(lastLogEntry.created).getTime() > 30 * 1000) {
			await pb.collection('night_data').create({
				current_guests: $activeClubNight?.current_guests,
				club_night: $activeClubNight?.id,
				created: new Date().toISOString()
			});
		}
	};

	// Function to run when the component is destroyed
	onDestroy(async () => {
		if (subscription) {
			isConnected = false;
			pb.collection('club_night').unsubscribe();
		}
	});
</script>

<div class="flex flex-col items-center text-center">
	{#if $activeClubNight}
		<p class="mb-4 text-4xl">Current guests:</p>
		{#if isConnected}
			<p class="mb-4 text-6xl">{localGuestCount}</p>
			<button on:click={incrementGuests} class="mb-2 w-full rounded bg-green-500 py-2 text-white"
				>Increase guests</button
			>
			<button on:click={decrementGuests} class="w-full rounded bg-red-500 py-2 text-white"
				>Decrease guests</button
			>
			<button on:click={reload} class="mt-2 w-full rounded bg-yellow-500 py-2 text-white"
				>Reload</button
			>
		{:else}
			<span class="loading loading-spinner loading-md"></span>
		{/if}

		<span class="text-md mt-4"
			>Connection: {#if isConnected}<span class="ml-2 text-green-500">✅</span>{:else}<span
					class="ml-2 text-red-500">🔴 please wait for a connection...</span
				>{/if}</span
		>
		<span class="text-md mt-4">Current Event: {$activeClubNight.event_name}</span>
	{:else}
		<p>No active night.</p>
	{/if}
	<ThemeSwitcher />
</div>
