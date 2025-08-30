import { io } from 'socket.io-client';
import ACTIONS from './Actions';

export const initSocket = async () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // e.g., http://localhost:5000

  const socket = io(BACKEND_URL, {
    transports: ['websocket'],
    reconnectionAttempts: Infinity,
    timeout: 10000,
  });

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log('✅ Connected to main server');
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      reject(err);
    });
  });
};
