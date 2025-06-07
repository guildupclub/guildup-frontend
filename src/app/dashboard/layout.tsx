"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  CreditCard, 
  Calendar, 
  User, 
  BarChart3, 
  Home,
  Settings,
  Wallet,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
//   {
//     title: "Overview",
//     href: "/dashboard",
//     icon: Home,
//     description: "Dashboard overview"
//   },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    description: "Manage your profile"
  },
  {
    title: "My Guild",
    href: "/dashboard/guild",
    icon: Users,
    description: "Manage your communities"
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
    description: "View your bookings"
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: Wallet,
    description: "Manage payments & earnings"
  },
//   {
//     title: "Analytics",
//     href: "/dashboard/analytics",
//     icon: BarChart3,
//     description: "View your performance"
//   },
//   {
//     title: "Settings",
//     href: "/dashboard/settings",
//     icon: Settings,
//     description: "Account settings"
//   }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 fixed top-16 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">My Space</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-sm text-gray-900">
                Welcome back, {session.user?.name?.split(" ")[0]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-8">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0 px-4 sm:px-6 lg:px-8">
            {/* Mobile Navigation - Horizontal Scroll */}
            <div className="lg:hidden mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || 
                      (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                    
                    return (
                      <Button
                        key={item.href}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "flex-shrink-0 flex flex-col items-center gap-1 h-16 px-3 min-w-[90px]",
                          isActive 
                            ? "bg-primary text-white hover:bg-primary/90" 
                            : "text-gray-900 hover:bg-gray-100"
                        )}
                        onClick={() => router.push(item.href)}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium leading-tight text-center line-clamp-2">{item.title}</span>
                      </Button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Desktop Navigation - Vertical */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                  
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2 h-auto min-h-[48px] px-2 py-2",
                        isActive 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "text-gray-900 hover:bg-gray-100"
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="font-semibold text-sm w-full text-left">{item.title}</span>
                        <span className={cn(
                          "text-xs leading-tight w-full text-left whitespace-nowrap",
                          isActive ? "text-white/80" : "text-gray-700"
                        )}>
                          {item.description}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white min-h-[600px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 