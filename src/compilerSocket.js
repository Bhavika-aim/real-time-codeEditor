import { io } from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export const initCompilerSocket = async () => {
  try {
    const compilerSocket = io(BACKEND_URL, { transports: ["websocket"] }); // no '/compiler' namespace
    compilerSocket.on("connect", () => console.log("✅ Compiler socket connected"));
    return compilerSocket;
  } catch (err) {
    console.error("❌ Compiler socket connection error:", err);
  }
};
