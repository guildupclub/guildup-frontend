"use client";

import Link from "next/link";
import {
  FileText,
  Compass,
  Users,
  ChevronDown,
  Search,
  Plus,
} from "lucide-react";
import { FaBars } from "react-icons/fa";
import { useEffect, useState } from "react";
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
import Guildup_logo_mobile from "./../../../public/GuildUp_logo_mobile.svg";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "../common/CommonText";
import { setActiveCommunity } from "@/redux/channelSlice";
import { setCommunityData } from "@/redux/communitySlice";
import type React from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import CreatorForm from "../form/CreatorForm";
import axios from "axios";
import { setUserFollowedCommunities } from "@/redux/userSlice";

// interface Community {
//   _id: string;
//   title: string;
//   name: string;
//   description: string;
//   subscription: boolean;
//   subscription_price: number;
//   num_member: number;
// }

export function Navbar(props: React.HTMLAttributes<HTMLElement>) {
  const COMMUNITY_PROFILE_PATH = "/community/profile";
  const COMMUNITY_MEMBERS_PATH = "/community/members";
  const COMMUNITY_CHANNEL_PATH = "/community/channel";
  const COMMUNITY_FEED_PATH = "/community/feed";
  const COMMUNITY_PATH = "/community";
  const FEED_PATH = "/feed";
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [isUser, setIsUser] = useState(true);
  // useEffect(() => {
  //   if ('isNewUser' in user) {
  //     setIsUser(false);
  //     console.info("this is user: ", user);
  //   }
  // }, [user]);
  // Assume communities are stored in state.community.communities (an array of Community)
  // const communities = useSelector((state: RootState) => state?.community?.communities);
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showEditCommunity, setShowEditCommunity] = useState(false);
  const [showCommunityList, setShowCommunityList] = useState(false);

  const [selectedCommunity, setSelectedCommunity] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  const [searchType, setSearchType] = useState("post");
  const userId = user?._id;
  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user`,
          {
            userId: userId,
          }
        );

        dispatch(setUserFollowedCommunities(res.data.data));
      } catch (error) {
        console.error(error);
      }
    }
    // fetchCommunities();
  }, []);
  const activeCommunity = useSelector(
    (state: any) => state.channel.activeCommunity
  );
  const activeCommunityId = activeCommunity?.id;

  const communities = useSelector(
    (state: RootState) => state?.user?.userFollowedCommunities
  );
  const getInitials = (name: string) => {
    return (
      name
        // [0].toUpperCase();
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    );
  };

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
    }

    // Optional cleanup if needed
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  function handleSelectCommunity(community: any) {
    dispatch(
      setActiveCommunity({
        id: community._id,
        name: community.name,
      })
    );

    if (user?._id) {
      dispatch(
        setCommunityData({
          communityId: community._id,
          userId: user._id,
        })
      );
    }
    router.push(`/community/${community._id}/profile`);
    setIsSidebarOpen(false);
  }

  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") {
      return true;
    }
    // For paths other than home, check if pathname starts with the path
    return path !== "/" && pathname?.startsWith(path);
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 z-50 bg-card pt-2 lg:px-20 w-full flex",
          props.className
        )}
        {...props}
      >
        <div className="container flex h-14 items-center px-5">
          <div className="flex gap-1 items-center">
            <button
              className="md:hidden flex items-center justify-center mr-2"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              <FaBars className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center space-x-2 mr-6">
              <Image
                src={Guildup_logo_mobile || "/placeholder.svg"}
                alt="GuildUp logo"
                className="h-8 w-auto md:hidden"
              />
              <Image
                src={guildup_logo || "/placeholder.svg"}
                alt="GuildUp"
                className="h-8 w-auto hidden md:block"
              />
            </Link>
          </div>

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
                    <Link href="/" className="flex flex-col items-center">
                      <Compass
                        className={`h-6 w-6 ${
                          isActive("/") ? "text-primary" : ""
                        }`}
                      />
                      <span className={isActive("/") ? "text-primary" : ""}>
                        {StringConstants.EXPLORE}
                      </span>
                    </Link>
                  </li>

                  <li className="w-18 px-3 rounded-xl">
                    <Link
                      href="/feeds"
                      className="flex flex-col items-center px-3 py-1.5"
                    >
                      <FileText
                        className={`h-6 w-6 ${
                          isActive("/feeds") ? "text-primary" : ""
                        }`}
                      />
                      <span
                        className={`h-6 ${
                          isActive("/feeds") ? "text-primary" : ""
                        }`}
                      >
                        {StringConstants.FEED}
                      </span>
                    </Link>
                  </li>
                  <li className="w-18 px-3 rounded-xl">
                    <Link
                      href={
                        activeCommunityId
                          ? `${COMMUNITY_PATH}/${activeCommunityId}${FEED_PATH}`
                          : `${COMMUNITY_FEED_PATH}`
                      }
                      className="flex flex-col items-center justify-center"
                    >
                      <Users
                        className={`w-6 h-6 ${
                          isActive("/community") ? "text-primary" : ""
                        }`}
                      />
                      <span
                        className={isActive("/community") ? "text-primary" : ""}
                      >
                        {StringConstants.EXPERTS}
                      </span>
                    </Link>
                  </li>
                  {/* ss */}
                </ul>
              </div>

              <div className="hidden md:block">
                {user?._id ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex flex-row bg-[#f2f2f2] rounded-e-full">
                        <Button
                          variant="ghost"
                          className="relative h-8 w-8 rounded-full pb-3"
                        >
                          <Avatar className="h-10 w-10">
                            {session?.user?.image ? (
                              <AvatarImage
                                src={session?.user?.image}
                                alt="User"
                              />
                            ) : (
                              <AvatarFallback>AR</AvatarFallback>
                            )}
                          </Avatar>
                        </Button>
                        <ChevronDown size={25} className="pt-2" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="bg-background/95 backdrop-blur text-zinc-200 border-gray-700"
                      align="end"
                    >
                      <DropdownMenuItem
                        asChild
                        className="hover:bg-primary-gradient border-b border-zinc-300"
                      >
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="hover:bg-primary-gradient border-b border-zinc-300"
                      >
                        <Link href="/booking">Bookings</Link>
                      </DropdownMenuItem>
                      {isUser && (
                        <DropdownMenuItem
                          asChild
                          className="hover:bg-primary-gradient border-b border-zinc-300"
                        >
                          <Link href="/payments">Payments</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="hover:bg-primary-gradient"
                        onClick={handleSignOut}
                      >
                        {StringConstants.SIGN_OUT}
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem className="hover:bg-primary-gradient border-b border-zinc-300">
                        <Link href='/profile'>Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-primary-gradient border-b border-zinc-300">
                      <Link href='/bookings'>Bookings</Link>
                      </DropdownMenuItem> */}
                      {/* {isMounted && isUser &&
                        <DropdownMenuItem
                          className="hover:bg-primary-gradient border-b border-zinc-300"
                        >
                          <Link href='/payments'>Payments</Link>
                        </DropdownMenuItem>} */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  // <Button className="bg-primary-gradient" onClick={() => signIn()}>
                  //   {StringConstants.SIGN_IN}
                  // </Button>

                  <Button
                    onClick={() =>
                      signIn(undefined, {
                        callbackUrl: `${window.location.origin}?hero=2`,
                      })
                    }
                  >
                    Sign In
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
            <Compass
              className={`w-6 h-6 ${isActive("/") ? "text-primary" : ""}`}
            />
            <span
              className={`text-xs mt-1 ${isActive("/") ? "text-primary" : ""}`}
            >
              {StringConstants.HOME}
            </span>
          </Link>
          <Link
            href="/feeds"
            className="flex flex-col items-center justify-center"
          >
            <FileText
              className={`w-6 h-6 ${isActive("/feeds") ? "text-primary" : ""}`}
            />
            <span
              className={`text-xs mt-1 ${
                isActive("/feeds") ? "text-primary" : ""
              }`}
            >
              {StringConstants.FEED}
            </span>
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
                ? `${COMMUNITY_PATH}/${activeCommunityId}${FEED_PATH}`
                : `${COMMUNITY_FEED_PATH}`
            }
            className="flex flex-col items-center justify-center"
          >
            <Users
              className={`w-6 h-6 ${
                isActive("/community") ? "text-primary" : ""
              }`}
            />
            <span className={isActive("/community") ? "text-primary" : ""}>
              {StringConstants.EXPERTS}
            </span>
          </Link>
          {user?._id ? (
            <button
              className="flex flex-col items-center justify-center"
              onClick={handleSignOut}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={session?.user?.image || ""} alt="User" />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <span className="text-xs mt-1">{StringConstants.SIGN_OUT}</span>
            </button>
          ) : (
            <button
              className="flex flex-col items-center justify-center bg-primary-gradient"
              onClick={() =>
                signIn(undefined, {
                  callbackUrl: `${window.location.origin}?hero=2`,
                })
              }
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="text-xs mt-1">{StringConstants.SIGN_IN}</span>
            </button>
          )}
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-16 left-0 h-screen w-64 bg-white shadow-md z-50 p-4 flex flex-col",
          "transform transition-transform duration-300 ease-in-out border border-solid border-t border-l border-r border-gray-200",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-1 flex flex-col overflow-y-auto">
          <div className="flex gap-2 px-2 justify-between w-full border-b border-gray-300 pb-2 mb-2">
            <h4 className="text-base font-medium">
              {StringConstants.CREATE_A_PAGE}
            </h4>
            <Dialog
              open={isCreatorFormOpen}
              onOpenChange={setIsCreatorFormOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg bg-primary hover:bg-zinc-300 text-zinc-300"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <CreatorForm
                onClose={() => setIsCreatorFormOpen(false)}
                // onSuccess={() => {
                // Invalidate the cache when a new community is created
                // queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
                // }}
              />
            </Dialog>
          </div>
          <div className="space-y-3 pb-16">
            {communities && communities.length > 0 ? (
              communities.map((community: any) => {
                if (!community) return;
                const isActive = activeCommunityId === community._id;
                return (
                  <button
                    key={community._id}
                    className={cn(
                      "-px-4 w-full flex items-center gap-3 rounded-lg py-2 justify-start bg-card",
                      isActive ? "bg-blue-500/20" : "bg-card"
                    )}
                    onClick={() => handleSelectCommunity(community)}
                  >
                    {/* Avatar */}
                    <Avatar
                      className={`w-10 h-10 rounded-lg ${
                        isActive ? "ring-2 ring-purple-500" : "null"
                      }`}
                    >
                      <AvatarImage
                        src={`/placeholder.svg?text=${getInitials(
                          community.name
                        )}`}
                        alt={community.name}
                        className="!rounded-lg"
                      />
                      <AvatarFallback className="!rounded-lg">
                        {getInitials(community.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Community Name */}
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isActive ? "text-blue-600 " : "text-gray-800"
                      )}
                    >
                      {community.name}
                    </span>

                    {/* Subscription Star (optional) */}
                    {community.subscription && (
                      <span className="ml-auto text-yellow-500 text-sm">
                        ⭐
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-center">
                {StringConstants.NO_COMMUNITIES_AVAILABLE}
              </p>
            )}
          </div>
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
