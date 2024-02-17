<script lang="ts">
	export let data;
	$: ({ user, isLoggedIn } = data);
</script>

{#if isLoggedIn}
	<h2>Welcome {user?.username}</h2>
	<a href="/logout">
		<button>Logout</button>
	</a>
{:else}
	<a href="/login">
		<button>Login using Github</button>
	</a>
{/if}
