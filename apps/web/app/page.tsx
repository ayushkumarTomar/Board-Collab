import Image from "next/image";
import { Button } from "@repo/ui/button";
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
//@ts-ignore
import generateName from "sillyname";
import localFont from 'next/font/local';
import { User } from "./user";

const skFont = localFont({
  src: "../public/fonts/neverRegular.woff"
});

export default function Home() {
  const avatar = createAvatar(avataaars, {
    seed: generateName(),
  });
  const svg = avatar.toDataUri();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className={`text-6xl font-bold mb-10 ${skFont.className}`}>Sketch Connect</h1>
        <div className="shadow-md bg-white rounded-lg p-8">
          <div className="relative w-40 h-40 mx-auto mb-6">
            <Image
              src={svg}
              alt='avatar'
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>
         <User />
        </div>
      </div>
    </div>
  );
}
