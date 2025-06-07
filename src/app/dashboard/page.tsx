"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Clock,
  DollarSign,
  Star,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const DashboardOverview = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);

  const statsCards = [
    {
      title: "Total Bookings",
      value: "24",
      change: "+12%",
      changeType: "positive" as const,
      icon: Calendar,
      description: "This month"
    },
    {
      title: "Earnings",
      value: "₹15,400",
      change: "+8%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Total earned"
    },
    {
      title: "Rating",
      value: "4.8",
      change: "+0.2",
      changeType: "positive" as const,
      icon: Star,
      description: "Average rating"
    },
    {
      title: "Communities",
      value: "3",
      change: "+1",
      changeType: "positive" as const,
      icon: Users,
      description: "Active communities"
    }
  ];

  const quickActions = [
    {
      title: "View Bookings",
      description: "Manage your upcoming appointments",
      href: "/dashboard/bookings",
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
      buttonText: "View All"
    },
    {
      title: "My Guild",
      description: "Manage your communities and guild",
      href: "/dashboard/guild",
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
      buttonText: "View Guild"
    },
    {
      title: "Check Payments",
      description: "Review earnings and transactions",
      href: "/dashboard/payments",
      icon: CreditCard,
      color: "bg-green-50 text-green-600",
      buttonText: "View Wallet"
    }
  ];

  const recentActivities = [
    {
      type: "booking",
      title: "New booking confirmed",
      description: "1-on-1 consultation with John Doe",
      time: "2 hours ago",
      status: "confirmed"
    },
    {
      type: "payment",
      title: "Payment received",
      description: "₹800 for coaching session",
      time: "1 day ago",
      status: "completed"
    },
    {
      type: "review",
      title: "New review received",
      description: "5-star rating from Sarah M.",
      time: "2 days ago",
      status: "positive"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] || "User"}!
        </h2>
        <p className="text-gray-800 mt-1">
          Here's an overview of your activity and performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={stat.changeType === "positive" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <p className="text-xs text-gray-800">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-800">{action.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(action.href)}
                    className="flex items-center gap-1"
                  >
                    {action.buttonText}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === "confirmed" ? "bg-blue-500" :
                  activity.status === "completed" ? "bg-green-500" :
                  activity.status === "positive" ? "bg-yellow-500" : "bg-gray-500"
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-700 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push("/dashboard/bookings")}
            >
              View All Activities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      {/* <Card>
        <CardHeader>
          <CardTitle>This Month's Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-800">Sessions Completed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₹6,400</div>
              <div className="text-sm text-gray-800">Earnings This Month</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">4.9</div>
              <div className="text-sm text-gray-800">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default DashboardOverview; 