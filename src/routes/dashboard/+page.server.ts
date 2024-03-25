import { POCKETBASE_URL, POCKETBASE_URL_LOCAL } from "$env/static/private";
import type { Actions } from "./$types";
import { fail } from '@sveltejs/kit'
import moment from "moment";
import PocketBase  from "pocketbase";

const isProd = process.env.NODE_ENV === 'production' ? true : false;
const pb = new PocketBase(isProd ? POCKETBASE_URL : POCKETBASE_URL_LOCAL);

export const actions = {
    updateTodo: async({ request }) => {
        console.log('updateTodo');
        
        const formData = await request.formData();
        const id = formData.get('id');
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

        let record;
        if (id) {
            // Update existing club night
            record = await pb.collection('club_night').update(String(id), data);
        } else {
            // Create new club night
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            record = await pb.collection('club_night').create(data);
        }

        return { success: true };
    },

    getLogData: async({ request }) => {
        const formData = await request.formData();
        const dateBegin = formData.get('dateBegin');
        const dateEnd = formData.get('dateEnd');
        

        if (!dateBegin && !dateEnd) {
            return fail(400, {});
        }

        const filter = 'created >= "' + moment(String(dateBegin)).toISOString() + '" && created <= "' + moment(String(dateEnd)).add(12, 'hours').toISOString() + '"';

        console.log(filter);

        const records = await pb.collection('night_data').getList(1, 200,{
            filter: filter,
        });

        if (!records || records.totalItems === 0) {
            console.log('No records found');
            return fail(400, {errorMessage: 'No records found'});
        }

        return { success: true, records: records };
    },
} satisfies Actions;