  import express from "express";
  import http from "http";
  const app = express();
  import cors from "cors"
  import { Server } from 'socket.io';
  app.use(cors({
    origin: "", 
    methods: ["GET", "POST"],
    credentials: true, 
  }));
  const dimension: Map<string, { height: number; width: number }> = new Map();

  const server = http.createServer(app);
  const port = process.env.PORT || 3001;

  const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
      credentials: true, 
    },
  });
  app.get("/" , (req , res)=>{
    return res.json({status:"working"})
  })
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

    socket.on('join-room', (roomId: string , username:string) => {
      console.log("joining room ::: " , roomId , " userID ::: " , socket.id , "username :: " , username)
      socket.join(roomId);
      registerClient(socket.id, roomId, username);
      socket.to(roomId).emit('user-joined' , username); 
      updateRoomCount(roomId)
    });

    socket.on('leave-room', (roomId: string) => {
      console.log("user left")
      socket.leave(roomId);
      try {
        const {username} = connectedClients.get(socket.id)
        if(!username) return
        socket.to(roomId).emit('user-disconnected' , username); 
        connectedClients.delete(socket.id);
        const clientsInRoom = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    
        console.log("users in room :: " , clientsInRoom )
        updateRoomCount(roomId)
      } catch (error) {
        console.log("Error :: " ,error)
        
      }
    });

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
    socket.on("dimension", (roomId: string, { height, width }: { height: number; width: number }) => {
      const existingDim = dimension.get(roomId);
      console.log("recieved dimensions for  :: " , roomId , " ::: " , {height , width})
      console.log("Current dimensions :: " , existingDim)

      if (existingDim) {
          if (height < existingDim.height || width < existingDim.width) {
              console.log("New dimensions are smaller.");
              if (height < existingDim.height){
                existingDim.height = height;
              }
              if (width < existingDim.width){
                existingDim.width = width;
              }
              
          } else {
              console.log("New dimensions are not smaller.");
          }
          socket.to(roomId).emit('change-dimensions' , existingDim)
      } else {
          dimension.set(roomId ,{height, width})
          console.log("No existing dimensions found for this room. setting ");
      }
  });


    socket.on("disconnect" , ()=>{
      const client = connectedClients.get(socket.id);
      const username = client ? client.username : undefined;
      const roomId = client ? client.roomId : undefined;
      
      if(!username) {
        console.log("username notfound roomId is :: " , roomId)
      }
      else{
      socket.to(roomId).emit('user-disconnected' , username); 
      }
      connectedClients.delete(socket.id);
      if(roomId) updateRoomCount(roomId)
      const clientsInRoom = io.sockets.adapter.rooms.get(roomId)?.size || 0;

      console.log("users in room :: " , clientsInRoom )
      if(clientsInRoom==0){
        dimension.delete(roomId)
      }
        

    })
  });

  server.listen(Number(port), "0.0.0.0" , () => {
    console.log('✔️ Server listening on port ' , port);
  });
