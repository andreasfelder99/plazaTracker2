<script lang="ts">
	import '../app.pcss';
	export let data;

	$: ({ user, isLoggedIn } = data);
</script>

<div class="drawer">
	<input id="mobile-view-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Navbar -->
		<div class="navbar w-full bg-base-300">
			<div class="flex-none lg:hidden">
				<label for="mobile-view-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block h-6 w-6 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path></svg
					>
				</label>
			</div>
			<div class="mx-2 flex-1 px-2"><a href="/">Plaza Tracker</a></div>
			<div class="hidden flex-none lg:block">
				<ul class="menu menu-horizontal">
					<!-- Navbar menu content -->
					{#if isLoggedIn}
						<li><a href="/dashboard">Dashboard</a></li>
						<li><a href="/counter">Counter</a></li>
					{:else}
						<li><a href="/">Home</a></li>
						<li><a href="/login">Login</a></li>
					{/if}
				</ul>
			</div>
		</div>
		<slot />
	</div>
	<div class="drawer-side">
		<label for="mobile-view-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu min-h-full w-80 bg-base-200 p-4">
			<!-- Sidebar content -->
			{#if isLoggedIn}
				<li><a href="/dashboard">Dashboard</a></li>
				<li><a href="/counter">Counter</a></li>
			{:else}
				<li><a href="/">Home</a></li>
				<li><a href="/login">Login</a></li>
			{/if}
		</ul>
	</div>
</div>
