"use client"

import { RecoilRoot } from "recoil"
import { Toaster } from "react-hot-toast"
function Providers({ children }:{
    children:React.ReactNode
}) {
  return (
    <RecoilRoot>
        <Toaster position="top-left"
      reverseOrder={false}/>
        {children}
    </RecoilRoot>
  )
}

export default Providers