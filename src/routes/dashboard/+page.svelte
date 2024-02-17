<script lang="ts">
	import Chart from '../../components/Chart.svelte';
	import DashboardHead from '../../components/DashboardHead.svelte';

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
		<ul class="menu rounded-box bg-base-100">
			<li><a>Item 1</a></li>
			<li><a>Item 2</a></li>
			<li><a>Item 3</a></li>
		</ul>
	</div>
</div>
