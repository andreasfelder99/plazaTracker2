<script lang="ts">
	import { onMount } from 'svelte';
	import PocketBase, { type RecordModel } from 'pocketbase';
	import { writable } from 'svelte/store';
	import moment from 'moment';
	import { createEventDispatcher } from 'svelte';
	import { io } from 'socket.io-client';

	const socket = io();
	const dispatch = createEventDispatcher();

	export let clubNightID: string | null = null;
	export let isNewClubNight: boolean = false;
	let pb: PocketBase;

	const activeClubNight = writable<RecordModel | null>(null);

	onMount(async () => {
		console.log('clubNightID', clubNightID);
		const url = import.meta.env.PROD ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';
		pb = new PocketBase(url);

		console.log('clubNightID', clubNightID);
		console.log('isNewClubNight', isNewClubNight);

		if (clubNightID) {
			const result = await pb.collection('club_night').getFirstListItem('id="' + clubNightID + '"');
			activeClubNight.set(result);
		} else {
			isNewClubNight = true;
			// Initialize activeClubNight with an empty object
			activeClubNight.set({
				id: '',
				event_name: '',
				event_date: '',
				current_guests: 0,
				max_guests: 0,
				collectionId: '',
				collectionName: '',
				created: '',
				updated: ''
			});
		}
	});
</script>

<div class="modal modal-open">
	<div class="modal-box">
		<h1>Club Night Details</h1>

		{#if $activeClubNight}
			<form class="mt-4 space-y-4" method="post" action="?/updateTodo">
				<div>
					<input name="id" type="hidden" value={$activeClubNight.id} />
				</div>
				<div>
					<label for="event_name" class="font-semibold">Club Night Name:</label>
					<input
						name="event_name"
						type="text"
						class="input input-bordered w-full"
						value={$activeClubNight.event_name}
					/>
				</div>
				<div>
					<label for="event_date" class="font-semibold">Club Night Date:</label>
					<input
						name="event_date"
						type="date"
						class="input input-bordered w-full"
						value={moment($activeClubNight.event_date).format('YYYY-MM-DD')}
					/>
				</div>
				<div>
					<label for="current_guests" class="font-semibold">Club Night Guests:</label>
					<input
						name="current_guests"
						type="number"
						class="input input-bordered w-full"
						value={$activeClubNight.current_guests}
					/>
				</div>
				<div>
					<label for="max_guests" class="font-semibold">Club Night Max Guests:</label>
					<input
						name="max_guests"
						type="number"
						class="input input-bordered w-full"
						value={$activeClubNight.max_guests}
					/>
				</div>
				<div class="flex justify-center">
					{#if isNewClubNight}
						<button class="btn btn-primary" type="submit"> Create Club Night </button>
					{:else}
						<button class="btn btn-primary" type="submit"> Update Club Night </button>
					{/if}
				</div>
			</form>
		{:else}
			<span class="loading loading-bars loading-lg"></span>
		{/if}
		<div class="modal-action flex justify-center">
			<button
				class="btn"
				on:click={() => {
					activeClubNight.set(null);
					isNewClubNight = false;
					dispatch('close');
					socket.emit('nightChanged');
				}}>Close</button
			>
		</div>
	</div>
</div>
