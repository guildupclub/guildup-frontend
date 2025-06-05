"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Clock,
  Star,
  DollarSign,
  Eye
} from "lucide-react";

const DashboardAnalyticsPage = () => {
  const performanceMetrics = [
    {
      title: "Total Views",
      value: "2,847",
      change: "+23%",
      changeType: "positive" as const,
      icon: Eye,
      description: "Profile views this month"
    },
    {
      title: "Booking Rate",
      value: "68%",
      change: "+15%",
      changeType: "positive" as const,
      icon: Calendar,
      description: "Conversion from views to bookings"
    },
    {
      title: "Response Time",
      value: "2.4h",
      change: "-30min",
      changeType: "positive" as const,
      icon: Clock,
      description: "Average response time"
    },
    {
      title: "Client Satisfaction",
      value: "4.9",
      change: "+0.2",
      changeType: "positive" as const,
      icon: Star,
      description: "Average rating"
    }
  ];

  const monthlyData = [
    { month: "Jan", bookings: 12, earnings: 9600 },
    { month: "Feb", bookings: 15, earnings: 12000 },
    { month: "Mar", bookings: 18, earnings: 14400 },
    { month: "Apr", bookings: 22, earnings: 17600 },
    { month: "May", bookings: 25, earnings: 20000 },
    { month: "Jun", bookings: 28, earnings: 22400 }
  ];

  const topServices = [
    { name: "1-on-1 Coaching", bookings: 45, revenue: 36000 },
    { name: "Group Sessions", bookings: 32, revenue: 19200 },
    { name: "Consultation", bookings: 28, revenue: 14000 },
    { name: "Workshop", bookings: 15, revenue: 12000 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your performance and growth metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">Performance insights</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={metric.changeType === "positive" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                  <p className="text-xs text-gray-600">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{data.month}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold">{data.bookings} bookings</div>
                      <div className="text-xs text-gray-600">₹{data.earnings.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Performing Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                      index === 0 ? "bg-yellow-500" :
                      index === 1 ? "bg-gray-400" :
                      index === 2 ? "bg-orange-500" : "bg-blue-500"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-600">{service.bookings} bookings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">₹{service.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Age 25-35</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Age 36-45</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Age 46+</span>
                <span className="text-sm font-medium">25%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">9AM - 12PM</span>
                <span className="text-sm font-medium">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">2PM - 5PM</span>
                <span className="text-sm font-medium">40%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">6PM - 9PM</span>
                <span className="text-sm font-medium">25%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Coaching</span>
                <span className="text-sm font-medium">₹36,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Consultations</span>
                <span className="text-sm font-medium">₹14,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Workshops</span>
                <span className="text-sm font-medium">₹12,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">What's Working Well</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">High client satisfaction (4.9/5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Strong booking conversion rate (68%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Consistent month-over-month growth</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Areas for Improvement</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Consider adding evening slots (6PM-9PM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Expand group session offerings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Focus on attracting 25-35 age group</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAnalyticsPage; 