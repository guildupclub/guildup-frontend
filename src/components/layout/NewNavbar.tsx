"use client";

import Link from "next/link";
import { Search, Bell, Calendar, MessageCircle, Compass, FileText, Menu, X } from "lucide-react";
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
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { TopBanner } from "./TopBanner";
import { CategoryNavbar } from "./CategoryNavbar";
import NotificationDropdown from "../notifications/NotificationDropdown";

const navigationItems = [
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Content Feed', href: '/feeds', icon: FileText },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'My Bookings', href: '/booking', icon: Calendar },
];

export function NewNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Close mobile search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileSearchOpen && !target.closest('.mobile-navbar-search') && !target.closest('[aria-label="Search"]')) {
        if (!searchQuery.trim()) {
          setIsMobileSearchOpen(false);
        }
      }
    };

    if (isMobileSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileSearchOpen, searchQuery]);

  return (
    <>
      {/* Top Banner */}
      <TopBanner />
      
      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src={guildup_logo || "/placeholder.svg"}
                  alt="GuildUp"
                  className="h-6 md:h-8 w-auto"
                />
              </Link>
            </div>

            {/* Navigation Items - Center (Desktop only) */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-1 text-sm font-medium transition-colors duration-200 pb-2 relative",
                      isActive(item.href)
                        ? "text-primary"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {isActive(item.href) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>

                                      {/* Mobile Right Section - Search, Notification, Drawer (left to right) */}
             <div className="flex items-center space-x-1 md:space-x-4">
               {/* Mobile Search - Expandable */}
               <div className="md:hidden flex items-center">
                 {isMobileSearchOpen ? (
                   // Simple expanded search input
                   <Input
                     type="search"
                     placeholder="Search..."
                     className="mobile-search-expand mobile-navbar-search bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                     style={{ width: 'calc(100vw - 120px)', maxWidth: '250px' }}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     onKeyPress={(e) => {
                       if (e.key === "Enter") {
                         handleSearch();
                         setIsMobileSearchOpen(false);
                         setSearchQuery("");
                       }
                     }}
                     onBlur={() => {
                       if (!searchQuery.trim()) {
                         setIsMobileSearchOpen(false);
                       }
                     }}
                     autoFocus
                   />
                 ) : (
                   // Search button
                   <button
                     onClick={() => setIsMobileSearchOpen(true)}
                     className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors mobile-nav-button mobile-navbar-item"
                     aria-label="Search"
                   >
                     <Search className="h-5 w-5" />
                   </button>
                 )}
               </div>

               {/* Mobile Notifications - Always show if user is signed in */}
               {user?._id && (
                 <div className="md:hidden mobile-notification-button">
                   <NotificationDropdown />
                 </div>
               )}

               {/* Mobile Menu Button (Drawer) - Always show */}
               <div className="md:hidden">
                 <button
                   onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                   className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors mobile-nav-button mobile-navbar-item"
                   aria-label="Menu"
                 >
                   {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                 </button>
               </div>

              {/* Desktop Right Side - Search and Profile */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="flex">
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-64 bg-gray-50 border border-gray-300 rounded-md pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                      onClick={handleSearch}
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Desktop User Section */}
                {user?._id ? (
                  <div className="flex items-center space-x-2">
                    {/* Notifications */}
                    <NotificationDropdown />

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            {session?.user?.image ? (
                              <AvatarImage
                                src={session?.user?.image || "/placeholder.svg"}
                                alt="User"
                              />
                            ) : (
                              <AvatarFallback>
                                {session?.user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/payments">Payments</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Button
                    onClick={() => signIn()}
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/20 mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl mobile-menu-slide" onClick={(e) => e.stopPropagation()}>
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

                         <div className="flex flex-col h-full">
               {/* Scrollable Content */}
               <div className="flex-1 overflow-y-auto px-4 py-4 mobile-menu-content mobile-menu-scrollable" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                 {/* Mobile Search */}
                 <div className="mb-6">
                   <div className="relative">
                                           <Input
                        type="search"
                        placeholder="Search..."
                        className="mobile-search-input w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-base placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSearch();
                            setIsMobileMenuOpen(false);
                          }
                        }}
                      />
                     <button
                       className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                       onClick={() => {
                         handleSearch();
                         setIsMobileMenuOpen(false);
                       }}
                     >
                       <Search className="h-4 w-4" />
                     </button>
                   </div>
                 </div>
                 
                 {/* Mobile Navigation Items */}
                 <div className="space-y-1 mb-6">
                   {navigationItems.map((item) => {
                     const Icon = item.icon;
                     return (
                       <Link
                         key={item.name}
                         href={item.href}
                         onClick={() => setIsMobileMenuOpen(false)}
                         className={cn(
                           "flex items-center space-x-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 relative",
                           isActive(item.href)
                             ? "bg-blue-50 text-blue-600 shadow-sm"
                             : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                         )}
                       >
                         <Icon className="h-5 w-5 flex-shrink-0" />
                         <span className="flex-1">{item.name}</span>
                         {isActive(item.href) && (
                           <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                         )}
                       </Link>
                     );
                   })}
                 </div>
                 
                                   {/* Quick Actions */}
                  {/* <div className="space-y-2 mb-6">
                    <div className="text-sm font-medium text-gray-500 px-4 mb-3">Quick Actions</div>
                    <Link
                      href="/help"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                    >
                      <span>Help & Support</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                    >
                      <span>Settings</span>
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                    >
                      <span>About GuildUp</span>
                    </Link>
                  </div> */}

                                     {/* Mobile User Section - Now inside scrollable area */}
                   {user?._id ? (
                     <div className="border-t border-gray-200 pt-6 pb-12">
                      <div className="text-sm font-medium text-gray-500 px-4 mb-3">Account</div>
                      
                      {/* User Info */}
                      <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-xl mx-0">
                        <Avatar className="h-12 w-12">
                          {session?.user?.image ? (
                            <AvatarImage
                              src={session?.user?.image || "/placeholder.svg"}
                              alt="User"
                            />
                          ) : (
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                              {session?.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                        </div>
                      </div>
                      
                      {/* User Actions */}
                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                        >
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/payments"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                        >
                          <span>Payments</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-4 w-full px-4 py-3 rounded-xl text-base text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-200"
                        >
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                                     ) : (
                     <div className="border-t border-gray-200 pt-6 pb-12">
                      <Button
                        onClick={() => {
                          signIn();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium rounded-xl"
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Navbar - Removed from here, now rendered in explore page */}
    </>
  );
} 