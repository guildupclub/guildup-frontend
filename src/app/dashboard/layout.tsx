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
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Home,
    description: "Dashboard overview"
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    description: "Manage your profile"
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
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "View your performance"
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Account settings"
  }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <nav className="space-y-3">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-4 h-14 px-4",
                        isActive 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "text-gray-900 hover:bg-gray-100"
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">{item.title}</span>
                        <span className={cn(
                          "text-xs mt-0.5",
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

            {/* Quick Stats Card - Mobile Hidden */}
            <div className="hidden lg:block mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">Total Bookings</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">This Month</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">Earnings</span>
                  <Badge variant="secondary">₹2,400</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 