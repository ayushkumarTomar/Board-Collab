import React from 'react'
import Image from 'next/image'
function Logo() {
  return (
    <Image 
    src={"/logo.svg"}
    width={30}
    height={30}
    alt="logo"/>
  )
}

export default Logo