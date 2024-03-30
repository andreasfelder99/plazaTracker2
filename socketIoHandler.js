import { Server } from 'socket.io'
import PocketBase from 'pocketbase';

/**
 * @param {Partial<import("socket.io").ServerOptions> | undefined} server
 */
export default function injectSocketIO(server){
    //PocketBase
    const url = process.env.NODE_ENV  === 'production' ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';
    const pb = new PocketBase(url);
    console.log('PocketBase URL: ', url);
    console.log('Environment: ', process.env.NODE_ENV);

    const io = new Server(server)


    getActiveNight().then((night) => {

        let currentGuests = night.current_guests;
        let clubNightID = night.id;
        let durchlauf = night.durchlauf;

        // Save the current number of guests to the database every 10 seconds
        setInterval(() => {
            if(currentGuests){
                saveCurrentGuests(currentGuests, durchlauf, clubNightID);
            }
        }, 10000);

        setInterval(() => {
            if(currentGuests){
                createLogEntry(currentGuests, clubNightID);
            }
        }, 5 * 60 * 1000);

        io.on('connection', (socket) => {
            socket.emit('eventFromServer', 'Environment: PRODUCTION')
            socket.emit('eventID', clubNightID)
            // Send the initial value of currentGuests to the client
            socket.emit('currentGuests', currentGuests)

            // Listen for events from the client to increase or decrease currentGuests
            socket.on('increaseGuests', () => {
                currentGuests++;
                durchlauf++;
                console.log('Increased guests');
                io.emit('currentGuests', currentGuests); // Notify all clients of the new value
            })

            socket.on('decreaseGuests', () => {
                if (currentGuests > 0) { // Ensure currentGuests does not go below 0
                    currentGuests--;
                }
                io.emit('currentGuests', currentGuests); // Notify all clients of the new value
            })

            socket.on('nightChanged', () => {
                getActiveNight().then((night) => {
                    socket.emit('eventFromServer', 'Night changed');
                    currentGuests = night.current_guests;
                    clubNightID = night.id;
                    durchlauf = night.durchlauf;
                    socket.emit('eventID', clubNightID)
                    socket.emit('currentGuests', currentGuests)
                    socket.emit('nightHasChanged');
                    console.log('Night changed to: ', clubNightID);
                })
            })
        })
    });
        


    async function getActiveNight() {
        const result = await pb.collection('club_night').getFirstListItem('is_active=true');
        console.log('Active club night: ', result);
        if(!result){
            throw new Error('No active club night found');
        }
        return result;
    }
    /**
     * @param {number} guests
     * @param {number} durchlauf
     *
     * @param {string} id
     */
    async function saveCurrentGuests(guests, durchlauf,  id) {
        const data = {
            current_guests: guests,
            durchlauf: durchlauf,
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const record = await pb.collection('club_night').update(id, data);
        console.log('Updated guests number to ' + guests + ' and durchlauf to ' + durchlauf + ' in the database.');
    }

    /**
     * @param {number} guests
     * @param {string} clubNightId
     */
    async function createLogEntry(guests, clubNightId){
        console.log('Current guests: ', guests);
        console.log('Club night ID: ', clubNightId);

        const data = {
            "current_guests": guests,
            "club_night": clubNightId
        };

        const result = await pb.collection('night_data').create(data);
        console.log('Log entry created: ', result);
    }

    console.log('Socket.io server injected');
}
