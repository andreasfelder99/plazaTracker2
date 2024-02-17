<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import PocketBase, { type RecordModel } from 'pocketbase';
	import { fly } from 'svelte/transition';

	// Define the type of the store
	const activeClubNight: Writable<RecordModel | null> = writable(null);
	let pb: PocketBase;

	onMount(async () => {
		pb = new PocketBase('http://localhost:8090');

		const initialClubNight = await pb.collection('club_night').getFirstListItem('is_active=true');

		if (initialClubNight) {
			activeClubNight.set(initialClubNight);
			pb.collection('club_night').subscribe(initialClubNight.id, (e) => {
				if (e.action === 'update') {
					activeClubNight.set(e.record); // update the activeClubNight object
					console.log(`club night updated to ${e.record.current_guests} guests`);
				}
			});
		} else {
			console.log('no active club night');
		}
	});

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
</script>

<p>Current guests:</p>

{#key $activeClubNight}
	<p in:fly={{ duration: 250, x: 0, y: -20 }}>
		{$activeClubNight ? $activeClubNight.current_guests : 'Loading...'}
	</p>
{/key}

<button on:click={incrementGuests}>Increase guests</button>
<button on:click={decrementGuests}>Increase guests</button>
