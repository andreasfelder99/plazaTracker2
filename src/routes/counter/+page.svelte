<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import PocketBase, { type RecordModel } from 'pocketbase';
	import ThemeSwitcher from '../../components/ThemeSwitcher.svelte';
	import { io } from 'socket.io-client';

	const socket = io();
	// Define the store for the active club night
	const activeClubNight = writable<RecordModel | null>(null);

	let id: string;
	let guestCount: number;
	let isConnected = false;

	// Initialize variables
	let pb: PocketBase;

	// Function to run when the component mounts
	onMount(async () => {
		// Set the URL based on the environment
		const url = import.meta.env.PROD ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';
		pb = new PocketBase(url);

		// Get the initial club night
		const initialClubNight = await pb.collection('club_night').getFirstListItem('is_active=true');
		if (initialClubNight) {
			activeClubNight.set(initialClubNight);
		}
	});

	//WebSocket logic
	socket.on('connect', () => {
		console.log('Client connected'); // true
		isConnected = true;
	});

	socket.on('eventID', (msg) => {
		id = msg;
	});

	socket.on('currentGuests', (msg) => {
		guestCount = msg;
	});

	socket.on('eventFromServer', (msg) => {
		console.log(msg);
	});

	socket.on('connect_error', () => {
		isConnected = false;
		socket.connect();
	});

	socket.on('disconnect', (reason, details) => {
		isConnected = false;
		console.log(reason, details);
	});
</script>

<div class="flex flex-col items-center text-center">
	{#if $activeClubNight}
		<p class="mb-4 text-4xl">Current guests:</p>
		<p class="mb-4 text-6xl">{guestCount}</p>
		<button
			on:click={() => socket.emit('increaseGuests')}
			class="mb-2 w-full rounded bg-green-500 py-2 text-white">Increase guests</button
		>
		<button
			on:click={() => socket.emit('decreaseGuests')}
			class="w-full rounded bg-red-500 py-2 text-white">Decrease guests</button
		>
	{:else}
		<span class="loading loading-spinner loading-md"></span>
	{/if}

	<span class="text-md mt-4"
		>Connection: {#if isConnected}<span class="ml-2 text-green-500">✅</span>{:else}<span
				class="ml-2 text-red-500">🔴 please wait for a connection...</span
			>{/if}</span
	>
	{#if $activeClubNight}
		<span class="text-md mt-4">Current Event: {$activeClubNight.event_name}</span>
	{:else}
		<p>No active night.</p>
	{/if}
	<ThemeSwitcher />
</div>
