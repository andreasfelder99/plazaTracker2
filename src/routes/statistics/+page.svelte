<script lang="ts">
	import PocketBase, { type ListResult, type RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
    import { applyAction, deserialize } from '$app/forms';
    import moment from 'moment';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
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
	import { Line } from 'svelte-chartjs';

    export let data;
	$: ({ user, isLoggedIn } = data);

    const allClubNights: Writable<RecordModel[] | null> = writable(null);

	let pb: PocketBase;
	let isNewClubNight = false;

	onMount(async () => {
		const url = import.meta.env.PROD ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';
		pb = new PocketBase(url);

		getAllClubNights();
	});


    async function getAllClubNights() {
        const resultList = await pb.collection('club_night').getList(1, 100, {
            sort: '-event_date'
        });
        allClubNights.set(resultList.items);
    }

    let selectedClubNightId: String;
    let dataFromServer: DataFromServer;
	let extractedData: extractedData;
    let showForm: boolean = true;
	let noDataFound: boolean = false;

    let chartHeader = '';

    async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
        const formData = new FormData(event.currentTarget);
        // Find the selected club night
        const selectedClubNight = $allClubNights?.find(clubNight => clubNight.id === selectedClubNightId);

        // Set chartHeader to the name and date of the selected club night
        if (selectedClubNight) {
            chartHeader = `${selectedClubNight.event_name} - ${moment(selectedClubNight.event_date).format('DD.MM.YYYY')}`;
        }

        const response = await fetch(event.currentTarget.action, {
            method: 'POST',
            body: formData,
        });

        const result: ActionResult = deserialize(await response.text());

        if (result.type === 'success') {
            dataFromServer = (result.data ?? {}).records as DataFromServer;
            extractedData = {
                items: dataFromServer.items.map(item => ({
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

	interface DataFromServer {
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
	function destroyChart() {
		showForm = true;
	}

</script>
    {#if user?.name == 'admin'}
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
                            text: chartHeader,
                        }
                    }
                }}
            />
            <button on:click={destroyChart} class="btn btn-warning"> New Chart </button>
        {:else}
            <form method="post" action="?/getChartData" on:submit|preventDefault={handleSubmit} class="space-y-4 ">
                <h1>Please select a night to create a Chart</h1>
                <div class="relative inline-flex">
                    <select name="selectedClubNightId" bind:value={selectedClubNightId} class="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline">
                        {#if $allClubNights !== null}
                            {#each $allClubNights as clubNight}
                                <option value={clubNight.id}>{clubNight.event_name} - {moment(clubNight.event_date).format('DD.MM.YYYY')}</option>
                            {/each}
                        {/if}
                    </select>
                    <svg class="absolute right-0 w-6 h-6 mt-2 mr-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
                <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-full">Create Chart</button>
                {#if noDataFound}
                    <div role="alert" class="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>No Data was found for the given time interval!</span>
                    </div>
				{/if}
            </form>
        {/if}
    {:else}
        <p>No permission.</p>
    {/if}