"use client";

import type * as React from "react";
import Link from "next/link";
import {
  Bell,
  Home,
  Compass,
  Users,
  ChevronDown,
  Search,
} from "lucide-react";
import { useState } from "react";
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
import guildup_logo from "../../../public/svg/GuildUp_Logo_Light.svg";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { EditCommunityModal } from "../form/editCommunity";

export function Navbar(props: React.HTMLAttributes<HTMLElement>) {
  const { data: session } = useSession();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  // Assume communities are stored in state.community.communities (an array of Community)
  // const communities = useSelector((state: RootState) => state?.community?.communities);

  const [searchQuery, setSearchQuery] = useState("");
  const [showEditCommunity, setShowEditCommunity] = useState(false);
  const [showCommunityList, setShowCommunityList] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  const [searchType, setSearchType] = useState("post");
  const activeCommunity = useSelector(
    (state: any) => state.channel.activeCommunity
  );
  const activeCommunityId = activeCommunity?.id;
  console.log("khbjkn", activeCommunityId)

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/api/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSignOut = () => {
    localStorage.clear();
    signOut();
  };

  // When "Edit Community" is clicked, show the community drop list instead of the modal.
  const handleEditClick = () => {
    setShowCommunityList(true);
  };

  // When user selects a community from the list, store the selection and open the modal
  const handleCommunitySelect = (community: { _id: string; name: string }) => {
    setSelectedCommunity(community);
    setShowCommunityList(false);
    setShowEditCommunity(true);
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 z-50 bg-card pt-2 px-4 lg:px-20 w-full flex",
          props.className
        )}
        {...props}
      >
        <div className="container flex h-14 items-center px-5">
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <Image
              src={guildup_logo || "/placeholder.svg"}
              alt="GuildUp"
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex grow items-center justify-between">
            {/* Searchbar */}
            <div className="flex flex-1 items-center">
              <div className="relative w-full max-w-xl">
                <div className="flex border-none">
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-background border-none pr-24 text-muted"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />

                  <div
                    className="absolute right-0 top-0 flex h-full w-12 items-center justify-center bg-[#334bff] rounded-tr-lg rounded-br-lg cursor-pointer"
                    onClick={handleSearch}
                  >
                    <Search className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex space-x-8 items-center justify-center">
              <div className="hidden md:flex items-center justify-center">
                <ul className="flex items-center space-x-2 text-muted">
                  <li className="w-18 px-3 rounded-xl">
                    <Link href="/" className="flex flex-col items-center px-3 py-1.5">
                      <Home className="h-6 w-6" />
                      <span className="h-6">Home</span>
                    </Link>
                  </li>
                  <li className="w-18  px-3 rounded-xl">
                    <Link href="/explore" className="flex flex-col items-center">
                      <Compass className="h-6 w-6" />
                      <span className="">Explore</span>
                    </Link>
                  </li>
                  <li className="w-18 px-3 rounded-xl">
                    <Link
                      href={
                        activeCommunityId
                          ? `/community/${activeCommunityId}/feed`
                          : "/community/feed"
                      }
                      className="flex flex-col items-center justify-center"
                    >
                      <Users className="w-6 h-6" />
                      <span>Experts</span>
                    </Link>
                  </li>
                  <li className="flex flex-col items-center w-18  px-3 rounded-xl">
                    <Bell className="h-6 w-6" />
                    <span className="">Notifications</span>
                  </li>
                </ul>
              </div>

              <div className="hidden md:block">
                {user?._id ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user?.avatar || "/placeholder.svg"}
                            alt="User"
                          />
                          <AvatarFallback>
                            {user?.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="bg-background/95 backdrop-blur text-zinc-200 border-gray-700"
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
                        onClick={handleEditClick}
                      >
                        Edit Community
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-primary-gradient"
                        onClick={handleSignOut}
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
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
          <Link href="/" className="flex flex-col items-center justify-center">
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center justify-center">
            <Compass className="w-6 h-6" />
            <span className="text-xs mt-1">Explore</span>
          </Link>
          {/* <Link
            href="/snips"
            className="flex flex-col items-center justify-center"
          >
            <Video className="w-6 h-6" />
            <span className="text-xs mt-1">Snips</span>
          </Link> */}
          <Link
            href={
              activeCommunityId
                ? `/community/${activeCommunityId}/feed`
                : "/community/feed"
            }
            className="flex flex-col items-center justify-center"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Community</span>
          </Link>

          {user?._id ? (
            <button
              className="flex flex-col items-center justify-center"
              onClick={handleSignOut}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.image || "/placeholder.svg"} alt="User" />
                <AvatarFallback>HHH</AvatarFallback>
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

      {/* Render community drop list if flag is true */}
      {/* {showCommunityList && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded p-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select a Community</h3>
            <ul className="space-y-2">
              {communities && communities.length > 0 ? (
                communities.map((comm: { _id: string; name: string }) => (
                  <li key={comm._id}>
                    <button
                      className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                      onClick={() => handleCommunitySelect(comm)}
                    >
                      {comm.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-center text-sm text-gray-500">No community available</li>
              )}
            </ul>
            <div className="mt-4 text-right">
              <Button variant="ghost" onClick={() => setShowCommunityList(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )} */}

      {/* Render EditCommunityModal if showEditCommunity is true.
          Pass in the selectedCommunity as a prop if needed. */}
      {/* {showEditCommunity && (
        <EditCommunityModal
          isOpen={showEditCommunity}
          onClose={() => setShowEditCommunity(false)}
          community={selectedCommunity}
        />
      )} */}
    </>
  );
}