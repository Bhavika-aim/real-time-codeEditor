import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const initCompilerSocket = async () => {
  const socket = io(`${BACKEND_URL}/compiler`, {
    transports: ['websocket'],
  });

  socket.on('connect', () => console.log('✅ Connected to compiler server'));
  socket.on('connect_error', (err) => console.error('❌ Compiler socket connection error:', err));
  return socket;
};
