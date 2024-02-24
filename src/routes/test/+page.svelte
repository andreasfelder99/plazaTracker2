<script lang="ts">
	import { io } from 'socket.io-client';
	const socket = io();

	let id: string;
	let count: number;

	//WebSocket logic
	socket.on('connect', () => {
		console.log('Client connected'); // true
	});

	socket.on('currentGuests', (msg) => {
		count = msg;
	});

	socket.on('eventFromServer', (msg) => {
		console.log(msg);
	});
</script>

<p>{count}</p>
<button class="btn btn-success" on:click={() => socket.emit('increaseGuests')}>+</button>
<button class="btn btn-warning" on:click={() => socket.emit('decreaseGuests')}>-</button>
