import type { Actions } from "./$types";
import { fail } from '@sveltejs/kit'
import PocketBase  from "pocketbase";
import { POCKETBASE_URL, POCKETBASE_URL_LOCAL } from "$env/static/private";

const isProd = process.env.NODE_ENV === 'production' ? true : false;
const pb = new PocketBase(isProd ? POCKETBASE_URL : POCKETBASE_URL_LOCAL);

export const actions = {
    getChartData: async({ request }) => {
        const formData = await request.formData();
        const clubNightID = formData.get('selectedClubNightId');

       if (!clubNightID) {
            return fail(400, {});
        }

        const filter = 'club_night = "' + clubNightID + '"';

        const records = await pb.collection('night_data').getList(1, 200,{
            filter: filter,
        });

        if (!records || records.totalItems === 0) {
            return fail(400, {});
        }

        return {success: true, records: records};

    }

} satisfies Actions;