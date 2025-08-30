const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const PORT = process.env.COMPILER_PORT || 5001;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'judge0-ce.p.rapidapi.com'; // Example: Judge0 API
const BASE_URL = `https://${RAPIDAPI_HOST}`;

// Middleware
app.use(express.json());

server.listen(PORT, () => {
  console.log(`⚡ Compiler Server running on http://localhost:${PORT}`);
});

// Compiler namespace
const compilerNamespace = io.of('/compiler');

compilerNamespace.on('connection', (socket) => {
  console.log('✅ Compiler socket connected:', socket.id);

  // Listen for code execution
  socket.on('compiler-output', async ({ roomId, code, language }) => {
    try {
      const output = await runCodeOnRapidAPI(code, language);
      socket.emit('compiler-output', { roomId, output });
    } catch (err) {
      socket.emit('compiler-output', { roomId, output: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('⚡ Compiler socket disconnected:', socket.id);
  });
});

// Helper: call RapidAPI (Judge0)
async function runCodeOnRapidAPI(code, language) {
  let langId;
  switch (language) {
    case 'javascript':
      langId = 63; // Judge0 ID for JS
      break;
    case 'python':
      langId = 71; // Python 3
      break;
    case 'text/x-c++src':
      langId = 54; // C++ (GCC 9.2.0)
      break;
    default:
      langId = 63;
  }

  const response = await fetch(`${BASE_URL}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
    body: JSON.stringify({
      source_code: code,
      language_id: langId,
    }),
  });

  const data = await response.json();

  if (data.stderr) return data.stderr;
  if (data.compile_output) return data.compile_output;
  return data.stdout || 'No output';
}
