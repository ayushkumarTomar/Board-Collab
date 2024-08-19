
import { atom } from "recoil";
const usernameAtom = atom({
    key: 'userName',
    default: '', 
  });

const roomIdAtom = atom({
    key:"roomId" ,
    default: '' 
})

export {usernameAtom , roomIdAtom}