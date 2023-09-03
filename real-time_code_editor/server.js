const express = require('express');
const app = express();

const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Action');
const path = require('path');

const server = http.createServer(app);
const io = new Server(server)

app.use(express.static('build'));
app.use((req, res, next) => {
     res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


const userSocketMap = {};
function getAllConnectedClient(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId]
            }
        })
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id)
    
    //user entry into room
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId)

        const clients = getAllConnectedClient(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            })
        })
    })
    
    // sync the code 
    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code})=>{
         //io.to : sent to all client in a room whereas socket.in sent to all except itself in a room
         socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code})
    })

    // sync the code after new user join the meeting
    socket.on(ACTIONS.SYNC_CODE, ({socketId, code})=>{
        io.to(socketId).emit(ACTIONS.CODE_CHANGE,{code})
   })

    //user left the room
    socket.on('disconnecting', () => {
       const rooms = [...socket.rooms];
       rooms.forEach((roomId) =>{
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
              socketId: socket.id,
              username: userSocketMap[socket.id],
        });
       })

       delete userSocketMap[socket.id];
       socket.leave();
    })
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
