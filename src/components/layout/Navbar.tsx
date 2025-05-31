"use client";

import Link from "next/link";
import { Compass, Users, ChevronDown, Plus, MessageCircle, BookOpen } from "lucide-react";
import { FaBars } from "react-icons/fa";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import guildup_logo from "../../../public/svg/GuildUp_Logo_Light.svg";
import Guildup_logo_mobile from "./../../../public/GuildUp_logo_mobile.svg";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "../common/CommonText";
import type React from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import CreatorForm from "../form/CreatorForm";
import { useChatContext } from "@/contexts/ChatContext";
import { MdOutlineRssFeed } from "react-icons/md";
import NotificationDropdown from "../notifications/NotificationDropdown";

// Import custom hooks and components
import { useNavbarCommunities } from "@/hooks/useNavbarCommunities";
import { useNavbarAuth } from "@/hooks/useNavbarAuth";
import { SearchBar } from "@/components/navbar/SearchBar";
import { DesktopNavigation } from "@/components/navbar/DesktopNavigation";
import { UserDropdown } from "@/components/navbar/UserDropdown";

export function Navbar(props: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.user);
  const { unreadCount } = useChatContext();
  
  // Local state
  const [isUser, setIsUser] = useState(true);
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Custom hooks
  const {
    communities,
    activeCommunity,
    getMySpaceLink,
    handleSelectCommunity,
    getInitials,
  } = useNavbarCommunities();
  
  const { session, handleCreatorButtonClick } = useNavbarAuth();

  // Utility functions
  const isActive = (path: string): boolean => {
    if (path === "/" && pathname === "/") {
      return true;
    }
    return path !== "/" && (pathname?.startsWith(path) ?? false);
  };

  // Effects
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 z-50 border-b border-gray-10 bg-[#F4F4FB] pt-2 lg:px-20 w-full flex",
          props.className
        )}
        {...props}
      >
        <div className="container flex h-14 items-center px-4">
          {/* Left section - Menu & Logo */}
          <div className="flex gap-6 items-center">
            <button
              className="md:hidden flex items-center justify-center"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              <FaBars className="h-5 w-5 text-gray-700" />
            </button>
            <Link href="/" className="flex items-center">
              <Image
                src={Guildup_logo_mobile || "/placeholder.svg"}
                alt="GuildUp logo"
                className="h-6 w-auto md:hidden"
              />
              <Image
                src={guildup_logo || "/placeholder.svg"}
                alt="GuildUp"
                className="h-8 w-auto hidden md:block"
              />
            </Link>
          </div>

          <div className="flex grow items-center justify-between">
            {/* Search Bar */}
            <div className="flex flex-1 items-center md:ml-8 lg:ml-12 ml-2">
              <SearchBar isSmallScreen={isSmallScreen} />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6 items-center justify-center">
              <DesktopNavigation isActive={isActive} getMySpaceLink={getMySpaceLink} />
              {user?._id && <NotificationDropdown />}
              <div className="hidden md:block ml-8">
                <UserDropdown isUser={isUser} />
              </div>
            </div>
          </div>

          {/* Mobile Notifications */}
          <div className="lg:hidden">
            {user?._id && <NotificationDropdown />}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 z-50 w-full h-14 bg-background border-t md:hidden">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          <Link href="/" className="flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <Compass className={`w-5 h-5 ${isActive("/") ? "text-primary" : ""}`} />
            </div>
            <span className={`text-[10px] ${isActive("/") ? "text-primary" : ""}`}>
              {StringConstants.HOME}
            </span>
          </Link>

          <Link href="/feeds" className="flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <MdOutlineRssFeed className={`w-5 h-5 ${isActive("/feeds") ? "text-primary" : ""}`} />
            </div>
            <span className={`text-[10px] ${isActive("/feeds") ? "text-primary" : ""}`}>
              {StringConstants.FEED}
            </span>
          </Link>

          <Link href="/chat" className="flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center relative">
              <MessageCircle className={`w-5 h-5 ${isActive("/chat") ? "text-primary" : ""}`} />
              {user?._id && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] ${isActive("/chat") ? "text-primary" : ""}`}>
              Chat
            </span>
          </Link>

          <Link href={getMySpaceLink()} className="flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <Users className={`w-5 h-5 ${isActive("/community") ? "text-primary" : ""}`} />
            </div>
            <span className={`text-[10px] ${isActive("/community") ? "text-primary" : ""}`}>
              {StringConstants.MY_SPACE}
            </span>
          </Link>

          {/* Mobile User Menu */}
          {user?._id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={session?.user?.image || ""} alt="User" />
                      <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-[10px]">My Account</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg"
                align="end"
                side="top"
                sideOffset={40}
              >
                <DropdownMenuItem
                  asChild
                  className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  <Link href="/chat" className="flex items-center justify-between">
                    <span>Chat</span>
                    {user?._id && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  <Link href="/blogs">Blogs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  <Link href="/booking">Bookings</Link>
                </DropdownMenuItem>
                {isUser && (
                  <DropdownMenuItem
                    asChild
                    className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                  >
                    <Link href="/payments">Payments</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={() => {}}
                >
                  {StringConstants.SIGN_OUT}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="flex flex-col items-center justify-center gap-1"
              onClick={() => handleCreatorButtonClick(setIsCreatorFormOpen)}
            >
              <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <Avatar className="h-4 w-4">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-[10px]">{StringConstants.SIGN_IN}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-16 left-0 h-screen w-64 bg-white shadow-md z-50 p-4 flex flex-col",
          "transform transition-transform duration-300 ease-in-out border border-solid border-t border-l border-r border-gray-200",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-1 flex flex-col overflow-y-auto">
          <div className="flex gap-2 px-2 justify-between w-full border-b border-gray-300 pb-2 mb-2">
            <h4 className="text-base font-medium">{StringConstants.CREATE_A_PAGE}</h4>
            <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg bg-primary hover:bg-blue-900 text-zinc-300"
                  onClick={() => handleCreatorButtonClick(setIsCreatorFormOpen)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <CreatorForm onClose={() => setIsCreatorFormOpen(false)} />
            </Dialog>
          </div>
          
          <div className="space-y-3 pb-16">
            {communities && communities.length > 0 ? (
              communities.map((community: any) => {
                if (!community) return null;
                const isActiveCommunitySidebar = activeCommunity?.id === community._id;
                return (
                  <button
                    key={community._id}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg py-2 justify-start bg-card",
                      isActiveCommunitySidebar ? "bg-blue-500/20" : "bg-card"
                    )}
                    onClick={() => handleSelectCommunity(community, () => setIsSidebarOpen(false))}
                  >
                    <Avatar
                      className={`w-10 h-10 rounded-lg ${
                        isActiveCommunitySidebar ? "ring-2 ring-purple-500" : ""
                      }`}
                    >
                      <AvatarImage
                        src={`/placeholder.svg?text=${getInitials(community.name)}`}
                        alt={community.name}
                        className="!rounded-lg"
                      />
                      <AvatarFallback className="!rounded-lg">
                        {getInitials(community.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isActiveCommunitySidebar ? "text-blue-600" : "text-gray-800"
                      )}
                    >
                      {community.name}
                    </span>
                    {community.subscription && (
                      <span className="ml-auto text-yellow-500 text-sm">⭐</span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="">
                {StringConstants.NO_COMMUNITIES_AVAILABLE}
                {!session && <p className="mt-2">Sign in to create or join communities</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
