import { Server } from 'socket.io'
import type { ViteDevServer } from 'vite'
import PocketBase from 'pocketbase';

//PocketBase
const url = process.env.NODE_ENV  === 'production' ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';
const pb = new PocketBase(url);


export const webSocketServer = {
    name: 'webSocketServer',
    configureServer(server: ViteDevServer) {
        if (!server.httpServer) return

        const io = new Server(server.httpServer)

        let currentGuests: number;
        let clubNightID: string;

        getActiveNight().then((activeNight) => {
            currentGuests = activeNight.current_guests;
            clubNightID = activeNight.id;

            setInterval(() => {
                if(currentGuests){
                    saveCurrentGuests(currentGuests, clubNightID);
                }
            }, 10000);

            io.on('connection', (socket) => {
                socket.emit('eventFromServer', 'Environment: dev')
                socket.emit('eventID', clubNightID)
                // Send the initial value of currentGuests to the client
                socket.emit('currentGuests', currentGuests)

                // Listen for events from the client to increase or decrease currentGuests
                socket.on('increaseGuests', () => {
                    currentGuests++;
                    console.log('Increased guests');
                    io.emit('currentGuests', currentGuests); // Notify all clients of the new value
                })

                socket.on('decreaseGuests', () => {
                    if (currentGuests > 0) { // Ensure currentGuests does not go below 0
                        currentGuests--;
                    }
                    io.emit('currentGuests', currentGuests); // Notify all clients of the new value
                })
            })
        });
    }
}

async function getActiveNight() {
    const result = await pb.collection('club_night').getFirstListItem('is_active=true');
    if(!result){
        throw new Error('No active club night found');
    }
    return result;
}
async function saveCurrentGuests(guests: number, id: string = '') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const record = await pb.collection('club_night').update(id, { current_guests: guests });
    console.log('Updated guests number to ' + guests + ' in the database.');
}