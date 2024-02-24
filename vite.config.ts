import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite'
import { webSocketServer } from './webSocketDevServer'


export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});
