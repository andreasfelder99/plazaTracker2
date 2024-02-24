<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from '../../components/Chart.svelte';
	import DashboardHead from '../../components/DashboardHead.svelte';
	import PocketBase, { type ListResult, type RecordModel } from 'pocketbase';
	import { writable, type Writable } from 'svelte/store';
	import moment from 'moment';
	import ClubNightDetailView from '../../components/ClubNightDetailView.svelte';

	const last10ClubNights: Writable<RecordModel[] | null> = writable(null);
	let pb: PocketBase;

	onMount(async () => {
		const url = import.meta.env.PROD ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';
		pb = new PocketBase(url);

		const resultList = await pb.collection('club_night').getList(1, 10, {
			sort: '-created'
		});
		last10ClubNights.set(resultList.items);

		console.log('last 10 club nights', resultList);
		console.log('last 10 club nights', $last10ClubNights);
	});

	let selectedClubNightID: string | null = null;

	function selectClubNight(id: string) {
		selectedClubNightID = id;
	}
	export let data;
	$: ({ user, isLoggedIn } = data);
</script>

<DashboardHead />

<div class="flex flex-row gap-6 p-6">
	<div class="card w-3/5 rounded-lg bg-base-100 p-6 shadow-md">
		<Chart />
	</div>
	<div class="w-2/5">
		<div class="card h-64 max-h-[80vh] overflow-auto rounded-lg bg-base-100 p-6 shadow-md">
			<ul class="space-y-4">
				{#each $last10ClubNights ?? [] as clubNight}
					<li class="border-b border-gray-200">
						<!-- svelte-ignore a11y-invalid-attribute -->
						<button
							class="text-md btn min-w-full font-semibold text-stone-600"
							on:click={() => selectClubNight(clubNight.id)}
						>
							{clubNight.event_name}, {moment(clubNight.event_date).format('DD.MM.YYYY')}
						</button>
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
