"use client";

import Link from "next/link";
import {
  Compass,
  Users,
  ChevronDown,
  Search,
  Plus,
  MessageCircle,
  Brain,
  Dumbbell,
  Apple,
  Heart,
  Sparkles,
  MoreVertical,
} from "lucide-react";
import { FaBars, FaSignInAlt } from "react-icons/fa";
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
import { API_ENDPOINTS } from "@/config/constants";

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
  const [isProgramsExpanded, setIsProgramsExpanded] = useState(false);
  const isCreator = user?.user?.is_creator ? true : false;
  console.log(isCreator);

  // Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // const handleCreatorButtonClick = () => {
  //   if (!session) {
  //     signIn(undefined, {
  //       callbackUrl: `${window.location.origin}?hero=1`,
  //     });
  //   }
  // };

  const handleCreatorButtonClick = () => {
    tracking.trackClick("creator_signup_button", {
      section: "header",
      user_signed_in: !!session,
      user_id: session?.user._id,
    });

    const expertUrl = API_ENDPOINTS.expertUrl;
    let newWindow = window.open(expertUrl, '_blank');
    console.log("expertURL", expertUrl);
    console.log("newWindow", newWindow);
    if (newWindow) {
      newWindow.focus();
    }
    newWindow = null;
    return;
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
          "fixed top-0 z-50 border-b border-gray-200/60 bg-white/95 backdrop-blur-md pt-0 lg:px-8 xl:px-12 w-full flex shadow-sm",
          props.className
        )}
        {...props}
      >
        <div className="container flex h-16 items-center px-4 md:px-6 lg:px-8 max-w-full">
          <div className="flex gap-3 md:gap-4 lg:gap-6 items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={Guildup_logo_mobile || "/placeholder.svg"}
                alt="GuildUp logo"
                className="h-7 w-auto md:hidden"
              />
              <Image
                src={guildup_logo || "/placeholder.svg"}
                alt="GuildUp"
                className="h-8 w-auto hidden md:block"
              />
            </Link>
          </div>

          <div className="flex grow items-center justify-between">
            <div className="flex flex-1 items-center justify-center md:ml-6 lg:ml-8 xl:ml-12 ml-2 gap-2">
              <div className="relative w-full max-w-[200px] sm:max-w-sm lg:max-w-lg xl:max-w-[500px]">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <Input
                    type="search"
                    placeholder="I want to ..."
                    className="w-full bg-white/90 backdrop-blur-sm border border-primary/60 rounded-full pl-9 md:pl-11 pr-8 md:pr-10 py-2 md:py-2.5 lg:py-3 text-xs md:text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg hover:border-primary/80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      onClick={() => setSearchQuery("")}
                    >
                      <svg className="h-3 w-3 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="md:hidden flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200">
                      <MoreVertical className="h-6 w-6 text-gray-700" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-xl w-56 z-50 max-h-[80vh] overflow-y-auto"
                    align="end"
                    side="bottom"
                    sideOffset={10}
                  >
                    <DropdownMenuItem asChild className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1">
                      <Link href="/" className="flex items-center gap-3 text-base font-medium">
                        <Compass className={`w-5 h-5 ${isActive("/") ? "text-primary" : "text-gray-600"}`} />
                        <span className={isActive("/") ? "text-primary" : "text-gray-700"}>{StringConstants.HOME}</span>
                      </Link>
                    </DropdownMenuItem>

                    <div className="w-full">
                      <button
                        onClick={() => setIsProgramsExpanded(!isProgramsExpanded)}
                        className="w-full hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1 flex items-center justify-between text-base font-medium"
                      >
                        <div className="flex items-center gap-3">
                          <Users className={`w-5 h-5 ${isActive("/programs") ? "text-primary" : "text-gray-600"}`} />
                          <span className={isActive("/programs") ? "text-primary" : "text-gray-700"}>Programs</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                            isProgramsExpanded ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isProgramsExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="pl-4 pr-2 py-2 space-y-1">
                          <Link
                            href="/programs/pcos"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-primary transition-colors duration-200 rounded-lg"
                            onClick={() => setIsProgramsExpanded(false)}
                          >
                            PCOS
                          </Link>
                          <Link
                            href="/programs/stress-anxiety"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-primary transition-colors duration-200 rounded-lg"
                            onClick={() => setIsProgramsExpanded(false)}
                          >
                            Stress &amp; Anxiety
                          </Link>
                          <Link
                            href="/programs/relationship"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-primary transition-colors duration-200 rounded-lg"
                            onClick={() => setIsProgramsExpanded(false)}
                          >
                            Relationship
                          </Link>
                          <Link
                            href="/experts"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-primary transition-colors duration-200 rounded-lg"
                            onClick={() => setIsProgramsExpanded(false)}
                          >
                            All Experts
                          </Link>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuItem asChild className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1">
                      <Link href="/feeds" className="flex items-center gap-3 text-base font-medium">
                        <MdOutlineRssFeed className={`w-5 h-5 ${isActive("/feeds") ? "text-primary" : "text-gray-600"}`} />
                        <span className={isActive("/feeds") ? "text-primary" : "text-gray-700"}>{StringConstants.FEED}</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1">
                      <Link href="/chat" className="flex items-center justify-between text-base font-medium">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <MessageCircle className={`w-5 h-5 ${isActive("/chat") ? "text-primary" : "text-gray-600"}`} />
                            {user?._id && unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-md">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                            )}
                          </div>
                          <span className={isActive("/chat") ? "text-primary" : "text-gray-700"}>Chat</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1">
                      <Link
                        href={getMySpaceLink()}
                        onClick={handleMySpaceClick}
                        className="flex items-center gap-3 text-base font-medium"
                      >
                        <Users className={`w-5 h-5 ${isActive("/community") ? "text-primary" : "text-gray-600"}`} />
                        <span className={isActive("/community") ? "text-primary" : "text-gray-700"}>{StringConstants.MY_SPACE}</span>
                      </Link>
                    </DropdownMenuItem>

                    {user?._id ? (
                      <>
                        <div className="border-t border-gray-100 my-2"></div>
                        <DropdownMenuItem asChild className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1">
                          <Link href="/profile" className="text-base font-medium">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1">
                          <Link href="/booking" className="text-base font-medium">Bookings</Link>
                        </DropdownMenuItem>
                        {isUser && (
                          <DropdownMenuItem asChild className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1">
                            <Link href="/payments" className="text-base font-medium">Payments</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1 text-base font-medium"
                          onClick={handleSignOut}
                        >
                          {StringConstants.SIGN_OUT}
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        {/* Sign In button commented out */}
                        {/* <div className="border-t border-gray-100 my-2"></div>
                        <DropdownMenuItem
                          className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1 text-base font-medium"
                          onClick={() =>
                            signIn(undefined, {
                              callbackUrl: `${window.location.origin}?hero=2`,
                            })
                          }
                        >
                          {StringConstants.SIGN_IN}
                        </DropdownMenuItem> */}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="hidden md:flex space-x-2 lg:space-x-3 xl:space-x-4 items-center">
              <div className="hidden md:flex items-center">
                <ul className="flex items-center space-x-1 lg:space-x-2 text-gray-700">

                  <li className="px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 relative group">
                    <div className="cursor-pointer">
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${
                          pathname?.startsWith("/programs") ? "text-primary" : "text-gray-700 group-hover:text-primary"
                        }`}
                      >
                        Programs
                      </span>
                    </div>

                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-56 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="py-3">
                        {[
                          { name: "PCOS", href: "/programs/pcos" },
                          { name: "Stress & Anxiety", href: "/programs/stress-anxiety" },
                          { name: "Relationship", href: "/programs/relationship" },
                        ].map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-primary transition-colors duration-200 rounded-lg mx-2"
                          >
                            <span className="font-medium text-base">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>

                  <li className="px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <Link href="/feeds" className="group">
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${
                          isActive("/feeds") ? "text-primary" : "text-gray-700 group-hover:text-primary"
                        }`}
                      >
                        {StringConstants.FEED}
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="hidden md:block ml-3 lg:ml-4 xl:ml-6">
                {user?._id ? (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200/50">
                          <Avatar className="h-8 w-8 ring-1 ring-gray-200">
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
                          <ChevronDown className="h-3 w-3 text-gray-500 transition-transform duration-200" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56 mt-2 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-lg"
                        align="end"
                      >
                        <DropdownMenuItem
                          asChild
                          className="px-4 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-lg mx-2 my-1"
                        >
                          <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="px-4 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-lg mx-2 my-1"
                        >
                          <Link
                            href="/chat"
                            className="flex items-center justify-between"
                          >
                            <span>Chat</span>
                            {user?._id && unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                            )}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="px-4 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-lg mx-2 my-1"
                        >
                          <Link href="/booking">Bookings</Link>
                        </DropdownMenuItem>
                        {isUser && (
                          <DropdownMenuItem
                            asChild
                            className="px-4 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-lg mx-2 my-1"
                          >
                            <Link href="/payments">Payments</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="px-5 py-3 text-base text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-xl mx-2 my-1"
                          onClick={handleSignOut}
                        >
                          {StringConstants.SIGN_OUT}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Sign In button commented out */}
                    {/* <Button
                      onClick={() =>
                        signIn(undefined, {
                          callbackUrl: `${window.location.href}?hero=2`,
                        })
                      }
                      className="px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 rounded-lg text-sm font-medium"
                      variant="outline"
                    >
                      Sign In
                    </Button> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-16 left-0 h-screen w-72 bg-white/95 backdrop-blur-md shadow-xl z-50 p-6 flex flex-col",
          "transform transition-transform duration-300 ease-in-out border-r border-gray-200/60",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-2 flex flex-col overflow-y-auto">
          <div className="flex gap-3 px-3 justify-between w-full border-b border-gray-200 pb-4 mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
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
                  className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={handleCreatorButtonClick}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <CreatorForm onClose={() => setIsCreatorFormOpen(false)} />
            </Dialog>
          </div>
          <div className="space-y-4 pb-20">
            {communities && communities.length > 0 ? (
              communities.map((community: any) => {
                if (!community) return null;
                const isActive = activeCommunityId === community._id;
                return (
                  <button
                    key={community._id}
                    className={cn(
                      "w-full flex items-center gap-4 rounded-xl py-3 px-3 justify-start transition-all duration-200 hover:shadow-md",
                      isActive ? "bg-primary/10 border border-primary/20" : "bg-gray-50/80 hover:bg-gray-100/80"
                    )}
                    onClick={() => handleSelectCommunity(community)}
                  >
                    <Avatar
                      className={`w-12 h-12 rounded-xl shadow-md ${
                        isActive ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <AvatarImage
                        src={community.image || "/placeholder.svg"}
                        alt={community.name}
                        className="!rounded-xl"
                      />
                      <AvatarFallback className="!rounded-xl">
                        {getInitials(community.name)}
                      </AvatarFallback>
                    </Avatar>

                    <span
                      className={cn(
                        "font-semibold text-base flex-1 text-left",
                        isActive ? "text-primary" : "text-gray-800"
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
              <div className="text-center py-8">
                <p className="text-gray-600 text-base font-medium">
                  {StringConstants.NO_COMMUNITIES_AVAILABLE}
                </p>
                {!session && (
                  <p className="mt-3 text-gray-500 text-sm">
                    Sign in to create or join communities
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
