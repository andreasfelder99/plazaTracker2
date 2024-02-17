<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<div class="mt-5 flex flex-col items-center space-y-5">
	<h1 class="text-2xl font-bold">Log in</h1>

	<form method="POST" class="w-full max-w-xs">
		<div class="space-y-5">
			<input
				class="label input input-bordered w-full"
				type="email"
				name="email"
				placeholder="E-mail"
				value={form?.email ?? ''}
			/>
			<input
				class="label input input-bordered w-full"
				type="password"
				name="password"
				placeholder="Password"
				value={form?.password ?? ''}
			/>
		</div>
		<button class="btn btn-primary mt-5 w-full" type="submit">Log in</button>
	</form>

	{#if form?.error}
		<p class="text-red-500">{form.error}</p>
	{/if}
</div>
