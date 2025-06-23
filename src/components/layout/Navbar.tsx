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
import { useRouter, usePathname } from "next/navigation";
import { StringConstants } from "../common/CommonText";
import type React from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import CreatorForm from "../form/CreatorForm";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { MdOutlineRssFeed } from "react-icons/md";
import { useChatContext } from "@/contexts/ChatContext";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { useTracking } from "@/hooks/useTracking";
import { toast } from "sonner";

// New architecture imports
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { useToast } from "@/contexts/ToastContext";
import { useUserCommunities } from "@/hooks/api/useCommunityQueries";
import { getInitials, createCommunityParam } from "@/utils/helpers";
import { ROUTES } from "@/utils/constants";

export function Navbar(props: React.HTMLAttributes<HTMLElement>) {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { 
    activeTab, 
    activeCommunity, 
    navigateToFeed, 
    navigateToExplore, 
    navigateToCommunity, 
    navigateToProfile,
    setActiveCommunity 
  } = useNavigation();
  const { showSuccess, showError } = useToast();
  const { unreadCount } = useChatContext();
  const router = useRouter();
  const pathname = usePathname();
  const tracking = useTracking();

  // Fetch user's communities using the new hook with proper error handling
  const { 
    data: userCommunitiesData, 
    isLoading: communitiesLoading, 
    error: communitiesError 
  } = useUserCommunities(
    user?.id || '', 
    undefined, 
    isAuthenticated && !!user?.id // Only fetch if user is authenticated and has an ID
  );
  
  console.log("userCommunitiesData", userCommunitiesData);
  console.log("communitiesError", communitiesError);
  
  // Safely extract communities array with fallback
  const communities = userCommunitiesData?.data || [];

  // Local state
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const isCreator = user?.is_creator || false;

  // Get the first valid community for fallback
  const getFirstValidCommunity = () => {
    return communities.find((community: any) => community && community._id);
  };

  // Generate community link with proper formatting and fallback handling
  const getMySpaceLink = () => {
    // If user is not authenticated, redirect to explore page
    if (!isAuthenticated) {
      return "/";
    }

    // If we have an active community, use it
    if (activeCommunity?.id) {
      const communityParam = createCommunityParam(activeCommunity.name, activeCommunity.id);
      return `${ROUTES.COMMUNITY}/${communityParam}/profile`;
    }

    // If we're still loading communities, prevent navigation
    if (communitiesLoading) {
      return "#"; // Prevent navigation while loading
    }

    // Try to get the first valid community
    const firstCommunity = getFirstValidCommunity();
    console.log("firstCommunity",firstCommunity);
    if (firstCommunity) {
      // Set the first community as active
      setActiveCommunity({
        id: firstCommunity._id,
        name: firstCommunity.name,
        image: firstCommunity.image || "",
      });
      const communityParam = createCommunityParam(firstCommunity.name, firstCommunity._id);
      return `${ROUTES.COMMUNITY}/${communityParam}/profile`;
    }

    // If there's an error and user is authenticated, show explore instead of no-community
    if (communitiesError && isAuthenticated) {
      return "/"; // Redirect to explore to help user find communities
    }

    // Only redirect to no-community as absolute last resort
    return "/no-community";
  };

  const handleMySpaceClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast("Sign in required to view your guild", {
        action: {
          label: "Sign In",
          onClick: () => login({ email: "", password: "" }), // This will trigger OAuth flow
        },
      });
      return;
    }

    // If still loading communities, prevent navigation
    if (communitiesLoading) {
      e.preventDefault();
      toast("Loading your communities...", {
        duration: 1000,
      });
      return;
    }

    // If there's an error loading communities, show error message but allow fallback
    if (communitiesError) {
      console.warn("Communities error, but allowing navigation to fallback");
      // Don't prevent navigation - let it go to explore page as fallback
      toast("Unable to load your communities, showing explore page instead", {
        duration: 2000,
      });
      // Don't prevent - allow the fallback navigation to happen
    }

    // If no communities and no error, suggest creating one
    if (!communitiesLoading && !communitiesError && communities.length === 0) {
      // Allow navigation to no-community page which has create community options
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      showSuccess("Successfully signed out!");
    } catch (error) {
      showError("Failed to sign out");
    }
  };

  const handleSelectCommunity = (community: any) => {
    navigateToCommunity(community._id, community.name);
    setIsSidebarOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/" || pathname === "/explore";
    }
    if (path === "/feeds") {
      return pathname === "/feeds" || pathname === "/feed";
    }
    if (path === "/community") {
      return pathname.startsWith("/community");
    }
    return pathname.startsWith(path);
  };

  const handleCreatorButtonClick = () => {
    tracking.trackClick("creator_button_clicked", {
      section: "header",
      user_signed_in: !!isAuthenticated,
      user_id: user?.id,
    });

    if (!isAuthenticated) {
      tracking.trackUserAction("signup_prompt_shown", {
        trigger: "creator_button",
        location: "home_page",
      });

      tracking.trackClick("signin_from_redirect", {
        trigger: "creator_button_prompt",
      });

      // Trigger OAuth login
      login({ email: "", password: "" });
      return;
    }

    tracking.trackUserAction("creator_form_opened", {
      source: "header_button",
      user_id: user?.id,
    });

    setIsDialogOpen(true);
  };

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle sidebar body scroll lock
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
              <div className="md:hidden">
                {user?.id && <NotificationDropdown />}
              </div>
            </div>

            <div className="hidden md:flex space-x-2 lg:space-x-4 xl:space-x-6 items-center">
              <div className="hidden md:flex items-center">
                <ul className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                  <li className="px-1 lg:px-2 py-2 rounded-full transition-all duration-200">
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

                  <li className="px-1 lg:px-2 py-2 rounded-full transition-all duration-200">
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

                  <li className="px-1 lg:px-2 py-2 rounded-full transition-all duration-200">
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
                      {user?.id && unreadCount > 0 && (
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

                  {user?.id && (
                    <li className="px-1 lg:px-2 py-2 rounded-full transition-all duration-200">
                      <NotificationDropdown />
                    </li>
                  )}
                </ul>
              </div>

              <div className="hidden md:block ml-2 lg:ml-4 xl:ml-6">
                {user?.id ? (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-50 transition-all duration-200">
                          <Avatar className="h-10 w-10">
                            {user?.image ? (
                              <AvatarImage
                                src={user.image || "/placeholder.svg"}
                                alt="User"
                              />
                            ) : (
                              <AvatarFallback>
                                {getInitials(user.name)}
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
                          <Link href="/profile">Profile</Link>
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
                            {user?.id && unreadCount > 0 && (
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
                          asChild
                          className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                        >
                          <Link href="/booking">Bookings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
                        >
                          <Link href="/payments">Payments</Link>
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
                      onClick={() => login({ email: "", password: "" })}
                      className="px-6 border border-blue-500 transition-all duration-200"
                      variant="outline"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>

              {!isCreator && (
                <Dialog
                  open={isAuthenticated ? isDialogOpen : false}
                  onOpenChange={setIsDialogOpen}
                >
                  <Button
                    className="border border-gray-300"
                    onClick={handleCreatorButtonClick}
                  >
                    Join as Expert
                  </Button>
                  {isAuthenticated && (
                    <CreatorForm onClose={() => setIsDialogOpen(false)} />
                  )}
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
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
              {user?.id && unreadCount > 0 && (
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

          {user?.id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                    <Avatar className="h-4 w-4">
                      <AvatarImage
                        src={user?.image || ""}
                        alt="User"
                      />
                      <AvatarFallback>
                        {getInitials(user.name)}
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
                  <Link href="/profile">Profile</Link>
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
                    {user?.id && unreadCount > 0 && (
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
                  asChild
                  className="hover:bg-primary-gradient border-b border-zinc-300"
                >
                  <Link href="/booking">Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="hover:bg-primary-gradient border-b border-zinc-300"
                >
                  <Link href="/payments">Payments</Link>
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
              onClick={() => login({ email: "", password: "" })}
            >
              <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <Avatar className="h-4 w-4">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>
                    <FaSignInAlt />
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-[10px]">{StringConstants.SIGN_IN}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
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
            {communitiesLoading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Loading communities...</div>
              </div>
            ) : communitiesError ? (
              <div className="text-center py-4">
                <div className="text-sm text-red-500">Failed to load communities</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Retry
                </button>
              </div>
            ) : communities && communities.length > 0 ? (
              communities.map((community: any) => {
                if (!community) return null;
                const isActive = activeCommunity?.id === community._id;
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
                        src={community.image || "/placeholder.svg"}
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
                {!isAuthenticated && (
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
