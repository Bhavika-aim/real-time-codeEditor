import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const initSocket = async () => {
  const socket = io(BACKEND_URL, {
    transports: ['websocket'],
  });

  socket.on('connect', () => console.log('✅ Connected to main server'));
  return socket;
};
