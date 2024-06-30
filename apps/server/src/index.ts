import express from "express";
import http from "http";
const app = express();
const server = http.createServer(app);

import { Server } from 'socket.io';
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

type Point = { x: number; y: number };

type DrawLine = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

io.on('connection', (socket) => {
  // Handling joining a room
  socket.on('join-room', (roomId: string) => {
    console.log("joining room ::: " , roomId , " userID ::: " , socket.id)
    socket.join(roomId);
    socket.to(roomId).emit('user-joined'); // Notify others in the room
  });

  // Handling leaving a room
  socket.on('leave-room', (roomId: string) => {
    console.log("user left")
    socket.leave(roomId);
    socket.to(roomId).emit('user-disconnected'); // Notify others in the room
  });

  // Event handlers within a specific room
  socket.on('client-ready', (roomId: string) => {
    socket.to(roomId).emit('get-canvas-state');
  });

  socket.on('canvas-state', (state, roomId: string) => {
    console.log('Received canvas state');
    socket.to(roomId).emit('canvas-state-from-server', state);
  });

  socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLine, roomId: string) => {
    socket.to(roomId).emit('draw-line', { prevPoint, currentPoint, color });
  });

  socket.on('clear', (roomId: string) => io.to(roomId).emit('clear'));
});

server.listen(3001, () => {
  console.log('✔️ Server listening on port 3001');
});
