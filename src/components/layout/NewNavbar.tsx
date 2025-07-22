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

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Top Banner */}
      <TopBanner />
      
      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src={guildup_logo || "/placeholder.svg"}
                  alt="GuildUp"
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            {/* Navigation Items - Center */}
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

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Right Side - Search and Profile */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative hidden sm:block">
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

              {/* User Section */}
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
      </nav>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Mobile Search */}
              <div className="mb-6">
                <div className="relative">
                                     <Input
                     type="search"
                     placeholder="Search..."
                     className="w-full bg-gray-50 border border-gray-300 rounded-md pl-4 pr-10 py-2 text-sm"
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
              
              {/* Mobile Navigation Items */}
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 relative",
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {isActive(item.href) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
              
              {/* Mobile User Section */}
              {user?._id ? (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10">
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500">{session?.user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/payments"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      Payments
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => signIn()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Category Navbar - Only show on explore page */}
      {pathname === '/explore' && <CategoryNavbar />}
    </>
  );
} 