<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import PocketBase, { type RecordModel } from 'pocketbase';
	import { fly } from 'svelte/transition';
	import ThemeSwitcher from '../../components/ThemeSwitcher.svelte';

	// Define the type of the store
	const activeClubNight: Writable<RecordModel | null> = writable(null);
	let pb: PocketBase;
	let subscription: any;

	onMount(async () => {
		const url = import.meta.env.PROD ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';

		console.log(url);
		pb = new PocketBase(url);

		const initialClubNight = await pb.collection('club_night').getFirstListItem('is_active=true');

		if (initialClubNight) {
			activeClubNight.set(initialClubNight);
			subscription = pb.collection('club_night').subscribe(initialClubNight.id, (e) => {
				console.log('Subscribed to changes');
				if (e.action === 'update') {
					activeClubNight.set(e.record); // update the activeClubNight object
					console.log(`club night updated to ${e.record.current_guests} guests`);
				}
			});
		} else {
			console.log('no active club night');
		}
	});

	const reload = async () => {
		if (subscription) {
			pb.collection('club_night').unsubscribe();
		}

		const clubNight = $activeClubNight;
		if (clubNight) {
			subscription = pb.collection('club_night').subscribe(clubNight.id, (e) => {
				console.log('resubscribed to real time changes');
				if (e.action === 'update') {
					activeClubNight.set(e.record); // update the activeClubNight object
					console.log(`club night updated to ${e.record.current_guests} guests`);
				}
			});
		}
	};

	const incrementGuests = async () => {
		const clubNight = $activeClubNight;
		if (clubNight) {
			await pb.collection('club_night').update(clubNight.id, {
				current_guests: clubNight.current_guests + 1
			});
			createLogEntry();
		}
	};

	const decrementGuests = async () => {
		const clubNight = $activeClubNight;
		if (clubNight && clubNight.current_guests > 0) {
			await pb.collection('club_night').update(clubNight.id, {
				current_guests: clubNight.current_guests - 1
			});
			createLogEntry();
		}
	};

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

	onDestroy(async () => {
		if (subscription) {
			pb.collection('club_night').unsubscribe();
			console.log('Unsubscribed from real time events');
		}
	});
</script>

<div class="flex flex-col items-center text-center">
	{#if $activeClubNight}
		<p class="mb-4 text-4xl">Current guests:</p>

		{#key $activeClubNight}
			<p in:fly={{ duration: 250, x: 0, y: -20 }} class="mb-4 text-6xl">
				{$activeClubNight ? $activeClubNight.current_guests : 'Loading...'}
			</p>
		{/key}

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
		<p>No active night.</p>
	{/if}

	<ThemeSwitcher />
</div>
