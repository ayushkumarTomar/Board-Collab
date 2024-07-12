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
const connectedClients = new Map();

const registerClient = (socketId:string, roomId:string, username:string) => {
  connectedClients.set(socketId, { roomId, username });
};
const updateRoomCount = (room:string) => {
  const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
  console.log("room count updated :: " , roomSize)
  io.to(room).emit('roomCount', roomSize);
};

io.on('connection', (socket) => {
  // Handling joining a room
  socket.on('join-room', (roomId: string , username:string) => {
    console.log("joining room ::: " , roomId , " userID ::: " , socket.id)
    socket.join(roomId);
    registerClient(socket.id, roomId, username);
    socket.to(roomId).emit('user-joined' , username); // Notify others in the room
    updateRoomCount(roomId)
  });

  // Handling leaving a room
  socket.on('leave-room', (roomId: string) => {
    console.log("user left")
    socket.leave(roomId);
    const {username} = connectedClients.get(socket.id)
    if(!username) return
    socket.to(roomId).emit('user-disconnected' , username); // Notify others in the room
    connectedClients.delete(socket.id);
    updateRoomCount(roomId)
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

  socket.on("disconnect" , ()=>{
    const {username , roomId} = connectedClients.get(socket.id)
    if(!username) return
    socket.to(roomId).emit('user-disconnected' , username); // Notify others in the room
    connectedClients.delete(socket.id);
    updateRoomCount(roomId)

  })
});

server.listen(3001, () => {
  console.log('✔️ Server listening on port 3001');
});
