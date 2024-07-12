"use client"
import toast from 'react-hot-toast'
import { FC, useEffect, useState } from 'react'
import { useDraw } from '../../../hooks/useDraw'
//@ts-ignore
import { ChromePicker } from 'react-color'
import { io } from 'socket.io-client'
import { drawLine } from '../../../lib/drawLine'
//@ts-ignore
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL)
import localFont from 'next/font/local'
import { usernameAtom ,  roomIdAtom} from '@/store/atom'
import { useRecoilState } from 'recoil'
//@ts-ignore
import generateName from "sillyname";
import Logo from './logo'
type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}

const skFont = localFont({
  src: "../../../public/fonts/neverRegular.woff"
});

const Page = ({params}:{
  params:{roomId:string}
}) => {
  const [username , setUsername] = useRecoilState(usernameAtom)
  const [color, setColor] = useState<string>('#000')
  const { canvasRef, onMouseDown, clear } = useDraw(createLine)
  const roomId = params.roomId
  console.log(params.roomId)
  const [numUser , setNumUsers] = useState("Loading")
  
  useEffect(() => {
    let usernameEff = username
    if(!usernameEff){
      usernameEff= generateName()
      setUsername(usernameEff)

    }

    const ctx = canvasRef.current?.getContext('2d')
    socket.emit("join-room" , roomId , usernameEff)
    socket.emit('client-ready' , roomId)


    socket.on("roomCount" , (roomCount:string)=>{
      setNumUsers(roomCount)
    })
    socket.on("user-joined" , (username:string)=>{
      toast.success(`${username} Joined`)

    })
    socket.on("user-disconnected" , (username)=>{
      toast.success(`${username} Left`)
    })
    
    socket.on('get-canvas-state', () => {
      if (!canvasRef.current?.toDataURL()) return
      console.log('sending canvas state')
      socket.emit('canvas-state', canvasRef.current.toDataURL() , roomId)
    })

    socket.on('canvas-state-from-server', (state: string) => {
      console.log('I received the state')
      const img = new Image()
      img.src = state
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
      }
    })

    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLineProps) => {
      if (!ctx) return console.log('no ctx here')
      drawLine({ prevPoint, currentPoint, ctx, color })
    })

    socket.on('clear', clear)

    return () => {
      socket.off('draw-line')
      socket.off('get-canvas-state')
      socket.off('canvas-state-from-server')
      socket.off('clear')
      socket.emit("leave-room" , roomId)
    }
  }, [canvasRef])

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-line', { prevPoint, currentPoint, color } , roomId)
    drawLine({ prevPoint, currentPoint, ctx, color })
  }

  return (
    <>
    <div className="w-screen bg-zinc-500 bg-opacity-10 flex justify-between items-center p-4">
      <div className="text-white text-xl font-bold flex">
        <Logo />
        <h1 className={`ml-3 ${skFont.className}`}>COLLABIFY</h1>
      </div>
      <div className="text-white text-md font-bold ">You : {username}</div>
      <div className="text-white text-md font-bold ml-8">Users in the room : {numUser}</div>
    </div>
  
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col gap-10 pr-10 ">
        <ChromePicker color={color} onChange={(e:any) => setColor(e.hex)} />
        <button
          type="button"
          className="p-2 border border-black bg-green-400 rounded-2xl"
          onClick={() => socket.emit('clear', roomId)}
        >
          Clear canvas
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={900}
        height={550}
        className="bg-slate-200 border border-black rounded-2xl"
      />
    </div>
  </>
  
  )
}

export default Page