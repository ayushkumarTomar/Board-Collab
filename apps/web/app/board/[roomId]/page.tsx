"use client"
import toast from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'
import { useDraw } from '../../../hooks/useDraw'
import { HexColorPicker } from "react-colorful";
import { io , Socket } from 'socket.io-client'
import { drawLine } from '../../../lib/drawLine'
import localFont from 'next/font/local'
import { usernameAtom } from '@/store/atom'
import { useRecoilState } from 'recoil'
import useWindowSize from '@/hooks/useWindow'
//@ts-ignore
import generateName from "sillyname";
import Logo from './logo'
type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}
let socket: Socket;


const skFont = localFont({
  src: "../../../public/fonts/neverRegular.woff"
});



interface Draw {
  prevPoint: { x: number, y: number };
  currentPoint: { x: number, y: number };
  ctx: CanvasRenderingContext2D;
}

const Page = ({ params }: { params: { roomId: string } }) => {
  const [username, setUsername] = useRecoilState(usernameAtom);
  const [color, setColor] = useState<string>('#000');
  //@ts-ignore
  const { canvasRef, onMouseDown, onTouchStart, clear } = useDraw(createLine);
  const roomId = params.roomId;
  const [numUser, setNumUsers] = useState("Connecting ...");
  const dimension = useWindowSize();
  const [userDimension , setUserDimension] = useState({height:0 , width:0})
  const scale = useRef(0)
  useEffect(()=>{

    if(socket){
    console.log("dimesions sending :: " , dimension)
    socket.emit("dimension" , roomId , dimension)
    }
    scale.current = window.devicePixelRatio; // Get the device's pixel ratio
    console.log("current scale is :: " , scale.current)


  } , [dimension , socket])
  useEffect(() => {

    let usernameEff = username;
    if (!usernameEff) {
      usernameEff = generateName();
      setUsername(usernameEff);
    }
    //@ts-ignore
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL)

    const ctx = canvasRef.current?.getContext('2d');

    socket.emit("join-room", roomId, usernameEff);
    socket.emit('client-ready', roomId);

    socket.on("roomCount", (roomCount: string) => {
      setNumUsers(roomCount);
    });

    socket.on("user-joined", (username: string) => {
      toast.success(`${username} Joined`);
    });

    socket.on("user-disconnected", (username: string) => {
      toast.error(`${username} Left`);
    });

    socket.on('get-canvas-state', () => {
      if (!canvasRef.current?.toDataURL()) return;
      socket.emit('canvas-state', canvasRef.current.toDataURL(), roomId);
    });

    socket.on('canvas-state-from-server', (state: string) => {
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });
    socket.on("change-dimensions" , (dim)=>{
      console.log('received dimensions' , dim)
      toast.success("Resizing canvas due to other users in the room" , {
        icon:"🤖" ,
        position:'top-center' ,
        duration: 4000
      })
      setUserDimension(dim)

    })

    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLineProps) => {
      if (!ctx) return;
      drawLine({ prevPoint, currentPoint, ctx, color });
    });

    socket.on('clear', clear);

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      onTouchStart();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
    };

    const canvas = canvasRef.current;
    canvas?.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas?.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas?.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      socket.off('draw-line');
      socket.off('get-canvas-state');
      socket.off('canvas-state-from-server');
      socket.off('clear');
      socket.off("change-dimensions")
      socket.emit("leave-room", roomId);

      canvas?.removeEventListener('touchstart', handleTouchStart);
      canvas?.removeEventListener('touchmove', handleTouchMove);
      canvas?.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-line', { prevPoint, currentPoint, color }, roomId);
    drawLine({ prevPoint, currentPoint, ctx, color });
  }


  return (
    <>
      <div className="w-full bg-zinc-500 bg-opacity-10 p-4 flex flex-col items-center overflow-auto">
        <div className="flex items-center mb-4">
          <Logo />
          <h1 className={`text-white text-lg sm:text-2xl font-bold ml-3 ${skFont.className}`}>
            COLLABIFY
          </h1>
        </div>
        <div className="text-white text-xs sm:text-lg font-bold mb-1 text-center">
          You: {username}
        </div>
        <div className="text-white text-xs sm:text-lg font-bold text-center">
          Users : {numUser}
          {" "} {" "} {" "}roomId : {roomId}
        </div>
      </div>

      <div className="w-full h-full flex flex-col md:flex-row justify-center items-center p-4 space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex justify-center items-center">
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            height={userDimension.height>0? userDimension.height : dimension.width > 640 ? 1100 : dimension.width - 20}
            width={userDimension.width>0? userDimension.width : dimension.width > 640 ? dimension.height - 200 : dimension.width - 40}
            className="bg-slate-200 border border-black rounded-lg shadow-md"
          />
        </div>
        <div className="flex right-0 flex-col items-center sm:items-start">
          <div className="w-64 sm:w-80 md:w-96"> 
            <HexColorPicker color={color} onChange={setColor} />;
          </div>
          <button
            type="button"
            className="p-2 sm:text-lg text-xs mt-3 border border-black bg-green-400 rounded-2xl hover:bg-green-500 transition-colors"
            onClick={() => socket.emit('clear', roomId)}
          >
            Clear canvas
          </button>
        </div>
      </div>
    </>
  );
}

export default Page;
