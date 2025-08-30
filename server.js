require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const ACTIONS = require('./src/components/Actions').default; // import default from Actions.js

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Main Socket.io server
const io = new Server(server, {
  cors: { origin: '*' },
});

// Rooms object to track users
const rooms = {};

// Main connection
io.on('connection', (socket) => {
  console.log('New socket connected:', socket.id);

  // Join room
  socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = user;

    // Notify all users in room
    socket.to(roomId).emit(ACTIONS.JOINED, { users: rooms[roomId], user, socketId: socket.id });
    socket.emit(ACTIONS.JOINED, { users: rooms[roomId], user, socketId: socket.id });
  });

  // Code changes
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code, socketId: socket.id });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code, socketId });
  });

  // Disconnect
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
});

// ------------------- Compiler Namespace -------------------
const compilerNamespace = io.of('/compiler');

compilerNamespace.on('connection', (socket) => {
  console.log('✅ Compiler socket connected:', socket.id);

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

      compilerNamespace.to(roomId).emit('compiler-output', { output: response.data.output || response.data });
    } catch (err) {
      compilerNamespace.to(roomId).emit('compiler-output', { output: err.toString() });
    }
  });
});

// Run server
const PORT = process.env.BACKEND_PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
