require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const ACTIONS = require('./src/components/Actions').default; // Make sure default export

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const rooms = {}; // roomId -> { socketId: user }

io.on('connection', (socket) => {
  console.log('New socket connected:', socket.id);

  // Join room
  socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = user;

    // Notify others
    socket.to(roomId).emit(ACTIONS.JOINED, { users: rooms[roomId], user, socketId: socket.id });

    // Notify self
    socket.emit(ACTIONS.JOINED, { users: rooms[roomId], user, socketId: socket.id });
  });

  // Handle code changes
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Disconnecting / leaving room
  socket.on('disconnecting', () => {
    const roomsJoined = Array.from(socket.rooms);
    roomsJoined.forEach((roomId) => {
      if (rooms[roomId]) {
        const user = rooms[roomId][socket.id];
        delete rooms[roomId][socket.id];

        socket.to(roomId).emit(ACTIONS.DISCONNECTED, { socketId: socket.id, user, users: rooms[roomId] });

        if (Object.keys(rooms[roomId]).length === 0) delete rooms[roomId];
      }
    });
  });

  // Compiler output via RapidAPI
  socket.on('compiler-output', async ({ roomId, code, language = 'javascript' }) => {
    try {
      const response = await axios.post(
        'https://codex-rapidapi.p.rapidapi.com',
        { language, code },
        {
          headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'codex-rapidapi.p.rapidapi.com',
          },
        }
      );

      io.to(roomId).emit('compiler-output', { output: response.data.output || JSON.stringify(response.data) });
    } catch (err) {
      io.to(roomId).emit('compiler-output', { output: err.toString() });
    }
  });
});

const PORT = process.env.BACKEND_PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
