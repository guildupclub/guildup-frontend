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
import { useTracking } from "@/hooks/useTracking";
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
  const isCreator = user?.user?.is_creator ? true : false;
  console.log(isCreator);
  const tracking = useTracking();

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
    if (session && typeof window !== "undefined") {
      const shouldOpen = localStorage.getItem("openCreatorModal");
      if (shouldOpen === "true") {
        localStorage.removeItem("openCreatorModal");

        tracking.trackUserAction("creator_form_opened_post_signin", {
          user_id: session.user._id,
          triggered_from: "post_signin",
        });

        setIsDialogOpen(true);
      }
    }
  }, [session]);

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
          "fixed top-0 z-50 border-b border-gray-200/60 bg-white/95 backdrop-blur-md pt-3 lg:px-8 xl:px-12 w-full flex shadow-sm",
          props.className
        )}
        style={{ fontFamily: 'Garamond, serif' }}
        {...props}
      >
        <div className="container flex h-16 items-center px-4 md:px-6 lg:px-8 max-w-full">
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
            <div className="flex flex-1 items-center md:ml-6 lg:ml-10 xl:ml-16 ml-3">
              <div className="relative w-full max-w-sm lg:max-w-md xl:max-w-[450px]">
                <div className="flex">
                  <Input
                    type="search"
                    placeholder={
                      isSmallScreen
                        ? "Search..."
                        : "Search creators, pages, or offerings..."
                    }
                    className="w-full bg-gray-50/80 backdrop-blur-sm border-gray-200 outline-1 rounded-2xl pl-4 md:pl-5 lg:pl-6 pr-10 md:pr-12 lg:pr-14 py-2 md:py-2.5 lg:py-3 text-sm md:text-base text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all duration-200"
                    style={{ fontFamily: 'Garamond, serif', fontWeight: '400' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={handleSearch}
                  >
                    <Search className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-4.5 lg:w-4.5" />
                  </button>
                </div>
              </div>
              <div
                className="
            md:hidden"
              >
                {" "}
                {user?._id && <NotificationDropdown />}
              </div>
            </div>
            <div className="hidden md:flex space-x-2 lg:space-x-4 xl:space-x-6 items-center">
              <div className="hidden md:flex items-center">
                <ul className="flex items-center space-x-2 lg:space-x-4 text-gray-700">

                  <li className="px-2 lg:px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 relative group">
                    <div className="flex flex-col items-center cursor-pointer">
                      <Users
                        className={`h-5 w-5 transition-colors duration-200 ${
                          isActive("/experts") ? "text-primary" : "group-hover:text-primary/70"
                        }`}
                      />
                      <span
                        className={`text-sm lg:text-base mt-1.5 hidden md:block transition-colors duration-200 ${
                          isActive("/experts") ? "text-primary font-semibold" : "group-hover:text-primary/70 font-medium"
                        }`}
                        style={{ fontFamily: 'Garamond, serif' }}
                      >
                        Find Expert
                      </span>
                    </div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-72 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="py-3">
                        {/* Expert Categories */}
                        {[
                          {
                            name: "Mental Health",
                            icon: Brain,
                            description: "Therapy, counseling & mental wellness",
                            href: "/experts?category=mental-health"
                          },
                          {
                            name: "Fitness",
                            icon: Dumbbell,
                            description: "Personal training & fitness coaching",
                            href: "/experts?category=fitness"
                          },
                          {
                            name: "Nutrition",
                            icon: Apple,
                            description: "Diet planning & nutritional guidance",
                            href: "/experts?category=nutrition"
                          },
                          {
                            name: "Relationship",
                            icon: Heart,
                            description: "Couples therapy & relationship counseling",
                            href: "/experts?category=relationship"
                          },
                          {
                            name: "Healing",
                            icon: Sparkles,
                            description: "Alternative & holistic healing practices",
                            href: "/experts?category=healing"
                          }
                        ].map((category, index) => (
                          <Link
                            key={category.name}
                            href={category.href}
                            className="block px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-primary transition-colors duration-200 rounded-xl mx-2"
                            onClick={() => {
                              tracking.trackClick("find_expert_category", {
                                source: "navbar_dropdown",
                                category_name: category.name,
                                user_id: session?.user._id,
                              });
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <category.icon className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-base" style={{ fontFamily: 'Garamond, serif' }}>{category.name}</div>
                                <div className="text-sm text-gray-500 truncate" style={{ fontFamily: 'Garamond, serif', fontWeight: '400' }}>
                                  {category.description}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                        
                        {/* Divider */}
                        <div className="border-t border-gray-100 my-2 mx-2"></div>
                        
                        {/* All Experts Option */}
                        <Link
                          href="/experts"
                          className="block px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-primary transition-colors duration-200 rounded-xl mx-2"
                          onClick={() => {
                            tracking.trackClick("find_expert_all", {
                              source: "navbar_dropdown",
                              user_id: session?.user._id,
                            });
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-base" style={{ fontFamily: 'Garamond, serif' }}>All Experts</div>
                              <div className="text-sm text-gray-500" style={{ fontFamily: 'Garamond, serif', fontWeight: '400' }}>Browse all available experts</div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </li>

                  <li className="px-2 lg:px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <Link href="/feeds" className="flex flex-col items-center group">
                      <MdOutlineRssFeed
                        className={`h-5 w-5 transition-colors duration-200 ${
                          isActive("/feeds") ? "text-primary" : "group-hover:text-primary/70"
                        }`}
                      />
                      <span
                        className={`text-sm lg:text-base mt-1.5 hidden md:block transition-colors duration-200 ${
                          isActive("/feeds") ? "text-primary font-semibold" : "group-hover:text-primary/70 font-medium"
                        }`}
                        style={{ fontFamily: 'Garamond, serif' }}
                      >
                        {StringConstants.FEED}
                      </span>
                    </Link>
                  </li>

                  <li className="px-2 lg:px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <Link
                      href="/chat"
                      className="flex flex-col items-center relative group"
                    >
                      <MessageCircle
                        className={`h-5 w-5 transition-colors duration-200 ${
                          isActive("/chat") ? "text-primary" : "group-hover:text-primary/70"
                        }`}
                      />
                      {user?._id && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-md">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                      <span
                        className={`text-sm lg:text-base mt-1.5 hidden md:block transition-colors duration-200 ${
                          isActive("/chat") ? "text-primary font-semibold" : "group-hover:text-primary/70 font-medium"
                        }`}
                        style={{ fontFamily: 'Garamond, serif' }}
                      >
                        Chat
                      </span>
                    </Link>
                  </li>

                  {user?._id && (
                    <li className="px-2 lg:px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200">
                      <NotificationDropdown />
                    </li>
                  )}
                </ul>
              </div>

              <div className="hidden md:block ml-4 lg:ml-6 xl:ml-8">
                {user?._id ? (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200/50">
                          <Avatar className="h-11 w-11 ring-2 ring-gray-100">
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
                          <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-64 mt-3 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-xl"
                        align="end"
                      >
                        <DropdownMenuItem
                          asChild
                          className="px-5 py-3 text-base text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-xl mx-2 my-1"
                        >
                          <Link href="/profile" style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}>Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="px-5 py-3 text-base text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-xl mx-2 my-1"
                        >
                          <Link
                            href="/chat"
                            className="flex items-center justify-between"
                            style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}
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
                          className="px-5 py-3 text-base text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-xl mx-2 my-1"
                        >
                          <Link href="/booking" style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}>Bookings</Link>
                        </DropdownMenuItem>
                        {isUser && (
                          <DropdownMenuItem
                            asChild
                            className="px-5 py-3 text-base text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-xl mx-2 my-1"
                          >
                            <Link href="/payments" style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}>Payments</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="px-5 py-3 text-base text-gray-700 hover:text-primary hover:bg-gray-50/80 rounded-xl mx-2 my-1"
                          style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}
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
                          callbackUrl: `${window.location.href}?hero=2`,
                        })
                      }
                      className="px-8 py-2.5 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl font-semibold"
                      style={{ fontFamily: 'Garamond, serif' }}
                      variant="outline"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
              {!isCreator && (
                <Dialog
                  open={session ? isDialogOpen : false}
                  onOpenChange={setIsDialogOpen}
                >
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 border-0 px-8 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    style={{ fontFamily: 'Garamond, serif' }}
                    onClick={handleCreatorButtonClick}
                  >
                    Join as Expert
                  </Button>
                  {session && (
                    <CreatorForm onClose={() => setIsDialogOpen(false)} />
                  )}
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white/95 backdrop-blur-md border-t border-gray-200/60 md:hidden shadow-lg">
        <div className="grid h-full max-w-lg grid-cols-6 mx-auto" style={{ fontFamily: 'Garamond, serif' }}>
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
          >
            <div className="w-7 h-7 flex items-center justify-center">
              <Compass
                className={`w-5 h-5 transition-colors duration-200 ${isActive("/") ? "text-primary" : "text-gray-600"}`}
              />
            </div>
            <span
              className={`text-xs font-medium ${isActive("/") ? "text-primary" : "text-gray-600"}`}
              style={{ fontFamily: 'Garamond, serif' }}
            >
              {StringConstants.HOME}
            </span>
          </Link>

          <Link
            href="/experts"
            className="flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
          >
            <div className="w-7 h-7 flex items-center justify-center">
              <Users
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive("/experts") ? "text-primary" : "text-gray-600"
                }`}
              />
            </div>
            <span
              className={`text-xs font-medium ${
                isActive("/experts") ? "text-primary" : "text-gray-600"
              }`}
              style={{ fontFamily: 'Garamond, serif' }}
            >
              Experts
            </span>
          </Link>

          <Link
            href="/feeds"
            className="flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
          >
            <div className="w-7 h-7 flex items-center justify-center">
              <MdOutlineRssFeed
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive("/feeds") ? "text-primary" : "text-gray-600"
                }`}
              />
            </div>
            <span
              className={`text-xs font-medium ${
                isActive("/feeds") ? "text-primary" : "text-gray-600"
              }`}
              style={{ fontFamily: 'Garamond, serif' }}
            >
              {StringConstants.FEED}
            </span>
          </Link>

          <Link
            href="/chat"
            className="flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
          >
            <div className="w-7 h-7 flex items-center justify-center relative">
              <MessageCircle
                className={`w-5 h-5 transition-colors duration-200 ${isActive("/chat") ? "text-primary" : "text-gray-600"}`}
              />
              {user?._id && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-md">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                isActive("/chat") ? "text-primary" : "text-gray-600"
              }`}
              style={{ fontFamily: 'Garamond, serif' }}
            >
              Chat
            </span>
          </Link>

          <Link
            href={getMySpaceLink()}
            className="flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
            onClick={handleMySpaceClick}
          >
            <div className="w-7 h-7 flex items-center justify-center">
              <Users
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive("/community") ? "text-primary" : "text-gray-600"
                }`}
              />
            </div>
            <span
              className={`text-xs font-medium ${
                isActive("/community") ? "text-primary" : "text-gray-600"
              }`}
              style={{ fontFamily: 'Garamond, serif' }}
            >
              {StringConstants.MY_SPACE}
            </span>
          </Link>

          {user?._id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200">
                  <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt="User"
                      />
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs font-medium text-gray-600" style={{ fontFamily: 'Garamond, serif' }}>My Account</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-xl"
                align="end"
                side="top"
                sideOffset={50}
              >
                <DropdownMenuItem
                  asChild
                  className="hover:bg-gray-50/80 border-b border-gray-100 px-4 py-3 rounded-xl mx-2 my-1"
                >
                  <Link href="/profile" className="text-base font-medium" style={{ fontFamily: 'Garamond, serif' }}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="hover:bg-gray-50/80 border-b border-gray-100 px-4 py-3 rounded-xl mx-2 my-1"
                >
                  <Link
                    href="/chat"
                    className="flex items-center justify-between text-base font-medium"
                    style={{ fontFamily: 'Garamond, serif' }}
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
                  className="hover:bg-gray-50/80 border-b border-gray-100 px-4 py-3 rounded-xl mx-2 my-1"
                >
                  <Link href="/booking" className="text-base font-medium" style={{ fontFamily: 'Garamond, serif' }}>Bookings</Link>
                </DropdownMenuItem>
                {isUser && (
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-50/80 border-b border-gray-100 px-4 py-3 rounded-xl mx-2 my-1"
                  >
                    <Link href="/payments" className="text-base font-medium" style={{ fontFamily: 'Garamond, serif' }}>Payments</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="hover:bg-gray-50/80 px-4 py-3 rounded-xl mx-2 my-1 text-base font-medium"
                  style={{ fontFamily: 'Garamond, serif' }}
                  onClick={handleSignOut}
                >
                  {StringConstants.SIGN_OUT}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
              onClick={() =>
                signIn(undefined, {
                  callbackUrl: `${window.location.origin}?hero=2`,
                })
              }
            >
              <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <Avatar className="h-5 w-5">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>
                    <FaSignInAlt />
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs font-medium text-gray-600" style={{ fontFamily: 'Garamond, serif' }}>{StringConstants.SIGN_IN}</span>
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
          "fixed top-16 left-0 h-screen w-72 bg-white/95 backdrop-blur-md shadow-xl z-50 p-6 flex flex-col",
          "transform transition-transform duration-300 ease-in-out border-r border-gray-200/60",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ fontFamily: 'Garamond, serif' }}
      >
        <div className="px-2 flex flex-col overflow-y-auto">
          <div className="flex gap-3 px-3 justify-between w-full border-b border-gray-200 pb-4 mb-4">
            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Garamond, serif' }}>
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
                      <AvatarFallback className="!rounded-xl" style={{ fontFamily: 'Garamond, serif' }}>
                        {getInitials(community.name)}
                      </AvatarFallback>
                    </Avatar>

                    <span
                      className={cn(
                        "font-semibold text-base flex-1 text-left",
                        isActive ? "text-primary" : "text-gray-800"
                      )}
                      style={{ fontFamily: 'Garamond, serif' }}
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
                <p className="text-gray-600 text-base font-medium" style={{ fontFamily: 'Garamond, serif' }}>
                  {StringConstants.NO_COMMUNITIES_AVAILABLE}
                </p>
                {!session && (
                  <p className="mt-3 text-gray-500 text-sm" style={{ fontFamily: 'Garamond, serif' }}>
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
