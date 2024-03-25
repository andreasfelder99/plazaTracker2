<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { Line } from 'svelte-chartjs';
	import moment from 'moment';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
	} from 'chart.js';	

	ChartJS.register(
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	);

	interface Item {
		club_night: string;
		collectionId: string;
		collectionName: string;
		created: string;
		current_guests: number;
		id: string;
		updated: string;
	}

	interface Data {
		page: number;
		perPage: number;
		totalItems: number;
		totalPages: number;
		items: Item[];
	}

	interface extractedData {
        items: Array<{
            created: string;
            current_guests: number;
        }>;
    }

	let dateBegin: String = '';
	let dateEnd: String = '';

	let data: Data;
	let extractedData: extractedData;

	let showForm: boolean = true;
	let noDataFound: boolean = false;

    async function handleGetChartData(event: { currentTarget: EventTarget & HTMLFormElement }) {
        const formData = new FormData(event.currentTarget);

        const response = await fetch(event.currentTarget.action, {
            method: 'POST',
            body: formData,
        });

        const result: ActionResult = deserialize(await response.text());

        if (result.type === 'success') {
			data = (result.data ?? {}).records as Data;
			console.log(data);
            extractedData = {
                items: data.items.map(item => ({
                    created: item.created,
                    current_guests: item.current_guests
                }))
            };
			showForm = false;
			
        } else {
			noDataFound = true;
            setTimeout(() => {
                noDataFound = false;
            }, 5000);
		} 
		await invalidateAll();
        applyAction(result);
    }

	function destroyChart() {
		showForm = true;
	}
</script>

<div class="min-h-full min-w-full">
		{#if !showForm}
			<Line
				data={{
					labels: extractedData.items.map(item => moment(item.created).format('HH:mm')),
					datasets: [
						{
							label: 'Current Guests',
							data: extractedData.items.map(item => item.current_guests),
							fill: false,
							borderColor: 'rgb(75, 192, 192)',
							tension: 0.1
						}
					]
				}}
				options={{
					responsive: true,
					plugins: {
						title: {
							display: true,
							text: `${dateBegin} - ${dateEnd}`
						}
					}
				}}
			/>
			<button on:click={destroyChart} class="btn btn-warning"> New Chart </button>
		{:else}
			<form method="post" action="?/getLogData" on:submit|preventDefault={handleGetChartData}>
				<div>
					<label for="dateBegin" class="font-semibold">Begin Date:</label>
					<input
						id="dateBegin"
						name="dateBegin"
						type="date"
						class="input input-bordered w-full"
						bind:value={dateBegin}
					/>
				</div>
				<div>
					<label for="dateEnd" class="font-semibold">End Date:</label>
					<input
						id="dateEnd"
						name="dateEnd"
						type="date"
						class="input input-bordered w-full"
						bind:value={dateEnd}
					/>
				</div>
				<div>
					<button type="submit" class="btn btn-primary mt-3"> Generate Chart </button>
					{#if noDataFound}
						<div role="alert" class="alert alert-error">
							<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							<span>No Data was found for the given time interval!</span>
					 	</div>
					{/if}
				</div>
			</form>
		{/if}
</div>
