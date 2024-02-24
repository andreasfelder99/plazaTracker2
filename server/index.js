import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { handler } from '../build/handler.js'
import PocketBase from 'pocketbase';

//PocketBase
const url = process.env.NODE_ENV  === 'production' ? 'https://plaza.pockethost.io/' : 'http://127.0.0.1:8090';
const pb = new PocketBase(url);
console.log('PocketBase URL: ', url);
console.log('Environment: ', process.env.NODE_ENV);

//Express
const port = 3000
const app = express()
const server = createServer(app)

const io = new Server(server)


getActiveNight().then((night) => {

    let currentGuests = night.current_guests;
    let clubNightID = night.id;
    
    setInterval(() => {
        if(currentGuests){
            saveCurrentGuests(currentGuests, clubNightID);
        }
    }, 10000);

    io.on('connection', (socket) => {
        socket.emit('eventFromServer', 'Environment: PRODUCTION')
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
    


async function getActiveNight() {
    const result = await pb.collection('club_night').getFirstListItem('is_active=true');
    console.log('Active club night: ', result);
    if(!result){
        throw new Error('No active club night found');
    }
    return result;
}
async function saveCurrentGuests(guests, id) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const record = await pb.collection('club_night').update(id, { current_guests: guests });
    console.log('Updated guests number to ' + guests + ' in the database.');
}

// SvelteKit should handle everything else using Express middleware
// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler)
server.listen(port)