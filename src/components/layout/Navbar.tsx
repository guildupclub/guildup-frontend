"use client";

import Link from "next/link";
import {
  Compass,
  Users,
  ChevronDown,
  Search,
  Plus,
  MessageCircle,
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
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { MdOutlineRssFeed } from "react-icons/md";
import { useChatContext } from "@/contexts/ChatContext";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

export function Navbar(props: React.HTMLAttributes<HTMLElement>) {
  const COMMUNITY_FEED_PATH = "/feed";
  const COMMUNITY_PATH = "/community";
  const FEED_PATH = "/feed";
  const PROFILE_PATH = "/profile";
  const NO_COMMUNITIES_AVAILABLE = "/no-community";
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { unreadCount } = useChatContext();
  const [isUser, setIsUser] = useState(true);
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showEditCommunity, setShowEditCommunity] = useState(false);
  const [showCommunityList, setShowCommunityList] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<{
    _id: string;
    name: string;
  } | null>(null);
  const [searchType, setSearchType] = useState("post");
  const userId = user?._id;
  const { heroVisible } = useSelector((state: RootState) => state.ui);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  // State to store fetchCommunities API response
  const [fetchedCommunities, setFetchedCommunities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
          {
            userId: userId,
          }
        );
        // Store the API response in state
        setFetchedCommunities(res.data.data);
        dispatch(setUserFollowedCommunities(res.data.data));
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    }
    if (userId) {
      fetchCommunities();
    }
  }, [userId, dispatch]);

  const activeCommunity = useSelector(
    (state: any) => state.channel.activeCommunity
  );
  const activeCommunityId = activeCommunity?.id;
  const activeCommunityName = activeCommunity?.name;

  const communities = useSelector(
    (state: RootState) => state?.user?.userFollowedCommunities
  );

  // Function to get the first non-null community
  const getFirstValidCommunity = () => {
    return fetchedCommunities.find((community) => community && community._id);
  };

  const cleanedCommunityName = activeCommunityName
    ? activeCommunityName
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-")
    : "";
  const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
  const communityParams = `${encodedCommunityName}-${activeCommunityId}`;
  const getMySpaceLink = () => {
    if (activeCommunityId) {
      return `${COMMUNITY_PATH}/${communityParams}${PROFILE_PATH}`;
    } else {
      const firstCommunity = getFirstValidCommunity();
      if (firstCommunity) {
        // Set the first community as active
        dispatch(
          setActiveCommunity({
            id: firstCommunity._id,
            name: firstCommunity.name,
            image: firstCommunity.image || "",
            background_image: firstCommunity.background_image || "",
            user_isBankDetailsAdded: false,
            user_iscalendarConnected: false,
          })
        );
        if (user?._id) {
          dispatch(
            setCommunityData({
              communityId: firstCommunity._id,
              userId: user._id,
            })
          );
        }
        return `${COMMUNITY_PATH}/${firstCommunity._id}${PROFILE_PATH}`;
      }
      return NO_COMMUNITIES_AVAILABLE;
    }
  };

  const handleMySpaceClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      toast("Sign in required to view your guild", {
        action: {
          label: "Sign In",
          onClick: () =>
            signIn(undefined, {
              callbackUrl: `${window.location.origin}`,
            }),
        },
      });
      return;
    }
    // If signed in, let the normal navigation happen
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/api/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSignOut = () => {
    localStorage.clear();
    signOut();
  };

  const handleEditClick = () => {
    setShowCommunityList(true);
  };

  const handleCommunitySelect = (community: { _id: string; name: string }) => {
    setSelectedCommunity(community);
    setShowCommunityList(false);
    setShowEditCommunity(true);
  };

  function handleSelectCommunity(community: any) {
    dispatch(
      setActiveCommunity({
        id: community._id,
        name: community.name,
        image: community.image || "",
        background_image: community.background_image || "",
        user_isBankDetailsAdded: false,
        user_iscalendarConnected: false,
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
    const cleanedName = community.name
      .replace(/\s+/g, "-")
      .replace(/\|/g, "-")
      .replace(/-+/g, "-");

    const encodedName = encodeURIComponent(cleanedName);

    router.push(`/community/${encodedName}-${community._id}/profile`);
    setIsSidebarOpen(false);
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") {
      return true;
    }
    return path !== "/" && pathname?.startsWith(path);
  };

  const handleCreatorButtonClick = () => {
    if (!session) {
      toast("Sign in required", {
        action: {
          label: "Sign In",
          onClick: () =>
            signIn(undefined, {
              callbackUrl: `${window.location.origin}?hero=1`,
            }),
        },
      });
    } else {
      setIsCreatorFormOpen(true);
    }
  };

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
          "fixed top-0 z-50 border-b border-gray-10 bg-[#F4F4FB] pt-2 lg:px-8 xl:px-12 w-full flex",
          props.className
        )}
        {...props}
      >
        <div className="container flex h-14 items-center px-3 md:px-4 lg:px-6 max-w-full">
          <div className="flex gap-3 md:gap-4 lg:gap-6 items-center">
            <button
              className="md:hidden flex items-center justify-center p-1"
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
            <div className="flex flex-1 items-center md:ml-4 lg:ml-8 xl:ml-12 ml-2">
              <div className="relative w-full max-w-xs lg:max-w-sm xl:max-w-[400px]">
                <div className="flex">
                  <Input
                    type="search"
                    placeholder={
                      isSmallScreen
                        ? "Search..."
                        : "Search creators, pages, or offerings..."
                    }
                    className="w-full bg-white outline-1 rounded-full pl-3 md:pl-4 lg:pl-5 pr-8 md:pr-10 lg:pr-12 py-1.5 md:py-2 lg:py-2.5 text-xs md:text-sm text-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/10 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-full cursor-pointer"
                    onClick={handleSearch}
                  >
                    <Search className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:flex space-x-2 lg:space-x-4 xl:space-x-6 items-center">
              <div className="hidden md:flex items-center">
                <ul className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                  <li className="px-1 lg:px-2  py-2 rounded-full transition-all duration-200">
                    <Link href="/" className="flex flex-col items-center">
                      <Compass
                        className={`h-5 w-5 ${
                          isActive("/") ? "text-primary" : ""
                        }`}
                      />
                      <span
                        className={`text-xs lg:text-sm mt-1 hidden md:block ${
                          isActive("/") ? "text-primary font-medium" : ""
                        }`}
                      >
                        {StringConstants.EXPLORE}
                      </span>
                    </Link>
                  </li>

                  <li className="px-1 lg:px-2  py-2 rounded-full transition-all duration-200">
                    <Link href="/feeds" className="flex flex-col items-center">
                      <MdOutlineRssFeed
                        className={`h-5 w-5 ${
                          isActive("/feeds") ? "text-primary" : ""
                        }`}
                      />
                      <span
                        className={`text-xs lg:text-sm mt-1 hidden md:block ${
                          isActive("/feeds") ? "text-primary font-medium" : ""
                        }`}
                      >
                        {StringConstants.FEED}
                      </span>
                    </Link>
                  </li>

                  <li className="px-1 lg:px-2  py-2 rounded-full transition-all duration-200">
                    <Link
                      href={getMySpaceLink()}
                      className="flex flex-col items-center"
                      onClick={handleMySpaceClick}
                    >
                      <Users
                        className={`w-5 h-5 ${
                          isActive("/community") ? "text-primary" : ""
                        }`}
                      />
                      <span
                        className={`text-xs lg:text-sm mt-1 hidden md:block ${
                          isActive("/community")
                            ? "text-primary font-medium"
                            : ""
                        }`}
                      >
                        {StringConstants.MY_SPACE}
                      </span>
                    </Link>
                  </li>

                  <li className="px-1 lg:px-2 py-2 rounded-full transition-all duration-200">
                    <Link
                      href="/chat"
                      className="flex flex-col items-center relative"
                    >
                      <MessageCircle
                        className={`h-5 w-5 ${
                          isActive("/chat") ? "text-primary" : ""
                        }`}
                      />
                      {user?._id && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                      <span
                        className={`text-xs lg:text-sm mt-1 hidden md:block ${
                          isActive("/chat") ? "text-primary font-medium" : ""
                        }`}
                      >
                        Chat
                      </span>
                    </Link>
                  </li>

                  {user?._id && (
                    <li className="px-1 lg:px-2 py-2 rounded-full transition-all duration-200">
                      <NotificationDropdown />
                    </li>
                  )}
                </ul>
              </div>

              <div className="hidden md:block ml-2 lg:ml-4 xl:ml-6">
                {user?._id ? (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-50 transition-all duration-200">
                          <Avatar className="h-10 w-10">
                            {session?.user?.image ? (
                              <AvatarImage
                                src={session?.user?.image || "/placeholder.svg"}
                                alt="User"
                              />
                            ) : (
                              <AvatarFallback>
                                {session?.user?.name?.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg"
                        align="end"
                      >
                        <DropdownMenuItem
                          asChild
                          className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                        >
                          <Link href="/dashboard/guild">My Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                        >
                          <Link
                            href="/chat"
                            className="flex items-center justify-between"
                          >
                            <span>Chat</span>
                            {user?._id && unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
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
                          className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                          onClick={handleSignOut}
                        >
                          {StringConstants.SIGN_OUT}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        signIn(undefined, {
                          callbackUrl: `${window.location.href}`,
                        })
                      }
                      className="px-6 border border-blue-500 transition-all duration-200"
                      variant="outline"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
              <Dialog
                open={session ? isDialogOpen : false}
                onOpenChange={setIsDialogOpen}
              >
                <Button
                  className="border border-gray-300 "
                  onClick={handleCreatorButtonClick}
                >
                  Join as Expert
                </Button>
                {session && (
                  <CreatorForm onClose={() => setIsDialogOpen(false)} />
                )}
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed bottom-0 left-0 z-50 w-full h-14 bg-background border-t md:hidden">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Compass
                className={`w-5 h-5 ${isActive("/") ? "text-primary" : ""}`}
              />
            </div>
            <span
              className={`text-[10px] ${isActive("/") ? "text-primary" : ""}`}
            >
              {StringConstants.HOME}
            </span>
          </Link>

          <Link
            href="/feeds"
            className="flex flex-col items-center justify-center gap-1"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <MdOutlineRssFeed
                className={`w-5 h-5 ${
                  isActive("/feeds") ? "text-primary" : ""
                }`}
              />
            </div>
            <span
              className={`text-[10px] ${
                isActive("/feeds") ? "text-primary" : ""
              }`}
            >
              {StringConstants.FEED}
            </span>
          </Link>

          <Link
            href="/chat"
            className="flex flex-col items-center justify-center gap-1"
          >
            <div className="w-6 h-6 flex items-center justify-center relative">
              <MessageCircle
                className={`w-5 h-5 ${isActive("/chat") ? "text-primary" : ""}`}
              />
              {user?._id && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] ${
                isActive("/chat") ? "text-primary" : ""
              }`}
            >
              Chat
            </span>
          </Link>

          <Link
            href={getMySpaceLink()}
            className="flex flex-col items-center justify-center gap-1"
            onClick={handleMySpaceClick}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Users
                className={`w-5 h-5 ${
                  isActive("/community") ? "text-primary" : ""
                }`}
              />
            </div>
            <span
              className={`text-[10px] ${
                isActive("/community") ? "text-primary" : ""
              }`}
            >
              {StringConstants.MY_SPACE}
            </span>
          </Link>

          {user?._id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                    <Avatar className="h-4 w-4">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt="User"
                      />
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-[10px]">My Account</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-background/95 backdrop-blur border-gray-700"
                align="end"
                side="top"
                sideOffset={40}
              >
                <DropdownMenuItem
                  asChild
                  className="hover:bg-primary-gradient border-b border-zinc-300"
                >
                  <Link href="/dashboard">My Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="hover:bg-primary-gradient border-b border-zinc-300"
                >
                  <Link
                    href="/chat"
                    className="flex items-center justify-between"
                  >
                    <span>Chat</span>
                    {user?._id && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="hover:bg-primary-gradient border-b border-zinc-300"
                >
                  <Link href="/blogs">Blogs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-primary-gradient"
                  onClick={handleSignOut}
                >
                  {StringConstants.SIGN_OUT}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="flex flex-col items-center justify-center gap-1"
              onClick={() =>
                signIn(undefined, {
                  callbackUrl: `${window.location.origin}?hero=2`,
                })
              }
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
                  className="w-8 h-8 rounded-lg bg-primary hover:bg-blue-900 text-zinc-300"
                  onClick={handleCreatorButtonClick}
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
                const isActive = activeCommunityId === community._id;
                return (
                  <button
                    key={community._id}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg py-2 justify-start bg-card",
                      isActive ? "bg-blue-500/20" : "bg-card"
                    )}
                    onClick={() => handleSelectCommunity(community)}
                  >
                    <Avatar
                      className={`w-10 h-10 rounded-lg ${
                        isActive ? "ring-2 ring-purple-500" : ""
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

                    <span
                      className={cn(
                        "font-medium text-sm",
                        isActive ? "text-blue-600" : "text-gray-800"
                      )}
                    >
                      {community.name}
                    </span>

                    {community.subscription && (
                      <span className="ml-auto text-yellow-500 text-sm">
                        ⭐
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="">
                {StringConstants.NO_COMMUNITIES_AVAILABLE}
                {!session && (
                  <p className="mt-2">Sign in to create or join communities</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
