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
		<button>Please log in</button>
	</a>
	<p>
		Please note that this is an early version and might contain a lot of bugs. Especially if you
		enter form data in an not expected format.
	</p>
{/if}
