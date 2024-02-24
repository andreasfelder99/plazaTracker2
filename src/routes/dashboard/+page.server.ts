import { POCKETBASE_URL, POCKETBASE_URL_LOCAL } from "$env/static/private";
import { fail } from '@sveltejs/kit'
import moment from "moment";
import PocketBase  from "pocketbase";

const isProd = process.env.NODE_ENV === 'production' ? true : false;
const pb = new PocketBase(isProd ? POCKETBASE_URL : POCKETBASE_URL_LOCAL);

export const actions = {
    updateTodo: async( {request }) => {
        console.log('updateTodo');
        
        const formData = await request.formData();
        console.log(formData.get('id'));
        const data = {
            "event_name": formData.get('event_name'),
            "max_guests": formData.get('max_guests'),
            "event_date": moment(String(formData.get('event_date'))).toISOString(),
            "current_guests": formData.get('current_guests'),
        };

        console.log(data);

        if (!data) {
            return fail(400, data)
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const record = await pb.collection('club_night').update(String(formData.get('id')), data);
        return { success: true };
    }
}