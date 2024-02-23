<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from '../../components/Chart.svelte';
	import DashboardHead from '../../components/DashboardHead.svelte';
	import PocketBase, { type ListResult, type RecordModel } from 'pocketbase';
	import { writable, type Writable } from 'svelte/store';
	import moment from 'moment';

	const activeClubNight: Writable<RecordModel | null> = writable(null);
	const last10ClubNights: Writable<RecordModel[] | null> = writable(null);
	let pb: PocketBase;

	onMount(async () => {
		const url = import.meta.env.PROD
			? import.meta.env.VITE_APP_POCKETBASE_URL
			: import.meta.env.VITE_APP_POCKETBASE_URL_LOCAL;
		pb = new PocketBase(url);

		const resultList = await pb.collection('club_night').getList(1, 10, {
			sort: '-created'
		});
		last10ClubNights.set(resultList.items);

		console.log('last 10 club nights', resultList);
		console.log('last 10 club nights', $last10ClubNights);
	});

	export let data;
	$: ({ user, isLoggedIn } = data);
</script>

<div class="flex w-full flex-row flex-wrap p-3">
	<DashboardHead />
</div>

<div class="flex flex-row gap-3 p-3">
	<div class="w-3/5 bg-base-100">
		<Chart />
	</div>
	<div class="w-2/5 bg-base-100">
		<div class="h-64 max-h-[80vh] overflow-auto">
			<ul class="menu min-h-full rounded-box bg-base-300">
				{#each $last10ClubNights ?? [] as clubNight}
					<li class="border-b border-gray-200">
						<a href="/{clubNight.id}/details">
							{clubNight.event_name}, {moment(clubNight.event_date).format('DD.MM.YYYY')}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
