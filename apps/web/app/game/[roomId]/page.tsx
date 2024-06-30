"use client"
import toast from 'react-hot-toast'
import { FC, useEffect, useState } from 'react'
import { useDraw } from '../../../hooks/useDraw'
//@ts-ignore
import { ChromePicker } from 'react-color'


import { io } from 'socket.io-client'
import { drawLine } from '../../../lib/drawLine'
const socket = io('http://localhost:3001')

type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}

const Page = ({params}:{
  params:{roomId:string}
}) => {
  const [color, setColor] = useState<string>('#000')
  const { canvasRef, onMouseDown, clear } = useDraw(createLine)
  const roomId = params.roomId
  console.log(params.roomId)
  const [numUser , setNumUsers] = useState<number>(1)
  
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    socket.emit("join-room" , roomId)
    socket.emit('client-ready' , roomId)

    socket.on("user-joined" , ()=>{
      toast.success('One User joined!')
      setNumUsers(prev=>prev+1)

    })
    socket.on("user-disconnected" , ()=>{
      toast.error('One User Left!')
      setNumUsers(prev=>prev-1)

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
        

    <div className='<div className="w-screen  bg-gradient-to-br from-purple-400 via-green-500 to-red-500 flex justify-center items-center">
  w-screen h-screen items-center'>
      <div className='flex flex-col gap-10 pr-10'>
        <ChromePicker color={color} onChange={(e:any) => setColor(e.hex)} />
        <button
          type='button'
          className='p-2 rounded-md border border-black'
          onClick={() => socket.emit('clear' , roomId)}>
          Clear canvas
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={750}
        height={550}
        className='bg-slate-200 border border-black rounded-md'
      />
    </div>
    </>
  )
}

export default Page