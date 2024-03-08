<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from '../../components/Chart.svelte';
	import DashboardHead from '../../components/DashboardHead.svelte';
	import PocketBase, { type ListResult, type RecordModel } from 'pocketbase';
	import { writable, type Writable } from 'svelte/store';
	import moment from 'moment';
	import ClubNightDetailView from '../../components/ClubNightDetailView.svelte';
	import { io } from 'socket.io-client';

	const socket = io();
	const last10ClubNights: Writable<RecordModel[] | null> = writable(null);
	const activeClubNight: Writable<RecordModel | null> = writable(null);

	let pb: PocketBase;
	let isNewClubNight = false;

	onMount(async () => {
		const url = import.meta.env.PROD ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';
		pb = new PocketBase(url);

		getLast10ClubNights();
	});

	function createNewClubNight() {
		isNewClubNight = true;
		selectedClubNightID = null; // Set selectedClubNightID to null
	}

	async function getLast10ClubNights() {
		const resultList = await pb.collection('club_night').getList(1, 10, {
			sort: '-is_active'
		});
		last10ClubNights.set(resultList.items);
		for (const clubNight of resultList.items) {
			if (clubNight.is_active) {
				activeClubNight.set(clubNight);
			}
		}
	}

	let selectedClubNightID: string | null = null;

	function selectClubNight(id: string) {
		selectedClubNightID = id;
	}
	async function activateClubNight(id: string) {
		if ($last10ClubNights !== null) {
			for (const clubNight of $last10ClubNights) {
				if (clubNight.is_active) {
					await pb.collection('club_night').update(clubNight.id, { is_active: false });
				}
			}
		}
		await pb.collection('club_night').update(id, { is_active: true });
		console.log('Night has changed');
		socket.emit('nightChanged');
		getLast10ClubNights();
	}

	export let data;
	$: ({ user, isLoggedIn } = data);
</script>

<DashboardHead {activeClubNight} />

<div class="flex flex-row gap-6 p-6">
	<div class="card w-3/5 rounded-lg bg-base-200 p-6 shadow-md">
		<Chart />
	</div>
	<div class="w-2/5">
		<div class="card h-64 max-h-[80vh] overflow-auto rounded-lg bg-base-200 p-6 shadow-md">
			<ul class="space-y-4">
				{#each $last10ClubNights ?? [] as clubNight}
					<li class="border-b border-gray-200">
						<!-- svelte-ignore a11y-invalid-attribute -->
						<button
							class="text-md btn min-w-[66%] bg-base-300 font-semibold"
							on:click={() => selectClubNight(clubNight.id)}
						>
							{clubNight.event_name}, {moment(clubNight.event_date).format('DD.MM.YYYY')}
						</button>
						{#if clubNight.is_active}
							<span class="text-md btn-outline mb-2 min-w-[33%] font-bold text-green-500"
								>Active</span
							>
						{:else}
							<button
								class="text-md btn btn-outline mb-2 min-w-[33%] font-semibold text-yellow-500"
								on:click={() => activateClubNight(clubNight.id)}
							>
								Activate
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>
	{#if selectedClubNightID}
		<ClubNightDetailView
			bind:clubNightID={selectedClubNightID}
			on:close={() => (selectedClubNightID = null)}
		/>
	{/if}
</div>
<div class="flex flex-row gap-6 p-6">
	<div class="w-4/5">
		<div class="card h-64 max-h-[80vh] overflow-auto rounded-lg bg-base-200 p-6 shadow-md"></div>
	</div>
	<div class="w-1/5">
		<div class="card h-64 max-h-[80vh] overflow-auto rounded-lg bg-base-200 p-6 shadow-md">
			<button class="btn btn-success" on:click={createNewClubNight}>Create new event</button>
		</div>
	</div>
	{#if isNewClubNight}
		<ClubNightDetailView
			bind:clubNightID={selectedClubNightID}
			on:close={() => {
				selectedClubNightID = null;
				isNewClubNight = false;
			}}
		/>
	{/if}
</div>
