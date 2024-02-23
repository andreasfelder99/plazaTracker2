//hooks.server.ts
import { redirect, type Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { POCKETBASE_URL, POCKETBASE_URL_LOCAL } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
	const isProd = process.env.NODE_ENV === 'production' ? true : false;
	// Create a new PocketBase instance
	event.locals.pb = new PocketBase(isProd ? POCKETBASE_URL : POCKETBASE_URL_LOCAL);

	// Load the authStore from the cookie
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// Check if the user is authenticated
		if (event.locals.pb.authStore.isValid) {
			console.log('Valid authStore 1');
			// Refresh the user's authentication
			await event.locals.pb.collection('users').authRefresh();

			// Set the user in the locals object if the model is not null
			if (event.locals.pb.authStore.model !== null) {
				event.locals.user = structuredClone(event.locals.pb.authStore.model);
			}
		}
	} catch (err) {
		// Clear the authStore if there is an error
		event.locals.pb.authStore.clear();
	}

	// Check if the user is logged on every request to '/dashboard/...'
	if (event.url.pathname.startsWith('/dashboard')) {
		if (!event.locals.user) {
			// Redirect to the login page if the user is not logged in
			throw redirect(303, '/login');
		}
	}

	// Resolve the request
	const response = await resolve(event);

	// Set the cookie
	
	response.headers.set(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({ secure: isProd, sameSite: 'Lax' })
	);

	return response;
};
