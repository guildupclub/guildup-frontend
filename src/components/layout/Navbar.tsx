"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Home,
  Compass,
  Users,
  ChevronDown,
  Search,
  Video,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import guildup_logo from "../../../public/guildup_logo.svg";
import { signIn, signOut } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { clearUser, setUser } from "@/redux/userSlice";
export function Navbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { data: session } = useSession();
  const user = useSelector((state: RootState) => state?.user?.sessionId);
  console.log("Adaes", user);
  return (
    <>
      <nav
        className={cn(
          "fixed top-0 z-50 w-full  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-4 lg:px-20",
          className
        )}
        {...props}
      >
        <div className="container flex h-14 items-center justify-between mx-auto">
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <Image src={guildup_logo} alt="GuildUp" className="h-8 w-auto" />
          </Link>

          <div className="flex flex-1 items-center space-x-2 justify-between md:justify-center lg:max-w-2xl">
            <div className="relative w-full max-w-lg">
              <div className="flex">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-black border-none pr-24 text-muted "
                />
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute right-12 top-0 h-full px-2 py-1 hover:bg-transparent text-muted"
                    >
                      Videos
                      <ChevronDown className="ml-1 h-4 w-4 text-muted" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Videos</DropdownMenuItem>
                    <DropdownMenuItem>Channels</DropdownMenuItem>
                    <DropdownMenuItem>Playlists</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
                <div className="absolute right-0 top-0 h-full w-12 text-center items-center flex justify-center bg-primary-gradient rounded-tr-lg rounded-br-lg">
                  <Search className="h-4 w-4 text-muted" />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center space-x-4">
            <ul className="flex items-center justify-center space-x-12 mx-auto text-muted">
              <li>
                <Link href="/">
                  <Home className="h-6 w-6" />
                  <span className="sr-only">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/explore">
                  <Compass className="h-6 w-6" />
                  <span className="sr-only">Explore</span>
                </Link>
              </li>
              <li>
                <Link href="/community/feed">
                  <Users className="h-6 w-6" />
                  <span className="sr-only">Community</span>
                </Link>
              </li>
              <li>
                <Bell className="h-6 w-6" />
                <span className="sr-only">Notifications</span>
              </li>
            </ul>
          </div>
          <div className="hidden md:block ">
            {user?.accessToken ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.image || "/placeholder.svg"}
                        alt="User"
                      />
                      <AvatarFallback>
                        {user?.name?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-zinc-200 border-gray-700 "
                  align="end"
                >
                  <DropdownMenuItem className="hover:bg-primary-gradient">
                    {user?.name}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary-gradient">
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-primary-gradient"
                    onClick={() => signOut()}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-primary-gradient" onClick={() => signIn()}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </nav>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto ">
          <Link href="/" className="flex flex-col items-center justify-center">
            <Home className="w-6 h-6 " />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href="/explore"
            className="flex flex-col items-center justify-center"
          >
            <Compass className="w-6 h-6" />
            <span className="text-xs mt-1">Explore</span>
          </Link>
          <Link
            href="/snips"
            className="flex flex-col items-center justify-center"
          >
            <Video className="w-6 h-6" />
            <span className="text-xs mt-1">Snips</span>
          </Link>
          <Link
            href="/community/feed"
            className="flex flex-col items-center justify-center"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Community</span>
          </Link>
          {user?.accessToken ? (
            <button
              className="flex flex-col items-center justify-center "
              onClick={() => signOut()}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={user?.image || "/placeholder.svg"}
                  alt="User"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="text-xs mt-1">Sign out</span>
            </button>
          ) : (
            <button
              className="flex flex-col items-center justify-center bg-primary-gradient"
              onClick={() => signIn()}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="text-xs mt-1">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
