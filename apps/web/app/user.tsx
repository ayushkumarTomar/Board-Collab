"use client"
import { redirect, useRouter } from 'next/navigation';
import React, { useState } from 'react'
//@ts-ignore
import generateName from "sillyname";
import { Socket, io } from 'socket.io-client'

const User = () => {
    const [roomId , setRoomId] = useState<string>("")
    const [username , setUsername] = useState<string>(generateName())
    const router = useRouter()
    const connectSocket = ()=>{
        let room;
        if(!roomId) room = Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join('')
        else room = roomId
        router.push(`/game/${room}`)
    }

  return (
    <>
    <input className="bg-slate-500 text-white px-4 py-2 rounded-md my-5" value={username} onChange={e=>setUsername(e.target.value)}/>
    <div>
    <input className="bg-slate-500 text-white px-4 py-2 rounded-md mb-5" value={roomId} onChange={e=>setRoomId(e.target.value)} placeholder='Enter RoomId'/>
    </div>
    <div className="bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer" onClick={connectSocket}>Create Room / Play</div>
    </>
  )
}

export {User}