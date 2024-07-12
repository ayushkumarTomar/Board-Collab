"use client"
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { usernameAtom , roomIdAtom } from '@/store/atom';
import { useRecoilState} from 'recoil';
//@ts-ignore
import generateName from "sillyname";

const User = () => {
    const [username , setUsername] = useRecoilState(usernameAtom)
    const router = useRouter()
    const [roomId , setRoomId]  = useRecoilState(roomIdAtom)
    
    const connectSocket = ()=>{
        let room;
        if(!roomId) room = Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join('')
        else room = roomId
        router.push(`/board/${room}`)
    }
    useEffect(()=>{setUsername(generateName())} , [])

  return (
    <>
    <input className="bg-slate-500 text-white px-4 py-2 rounded-xl my-5" value={username} onChange={e=>setUsername(e.target.value)}/>
    <div>
    <input className="bg-slate-500 text-white px-4 py-2 rounded-xl mb-5" value={roomId} onChange={e=>setRoomId(e.target.value)} placeholder='Enter RoomId'/>
    </div>
    <div className="bg-green-500 text-white px-4 py-2 rounded-2xl cursor-pointer" onClick={connectSocket}>Start</div>
    </>
  )
}

export {User}