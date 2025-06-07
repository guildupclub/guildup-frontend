"use client";

import React, { useEffect, useState } from "react";
import BookingCard from "@/components/booking/BookingCard";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Availablity from "@/components/booking/Availablity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";

interface Booking {
  _id: string;
  offering_id: {
    price: {
      amount: number;
      currency: string;
    };
    _id: string;
    title: string;
    description: string;
    type: string;
    duration: number;
  };
  provider_id: {
    _id: string;
    name: string;
    email: string;
  };
  client_id: string;
  start_time: string;
  status: string;
  payment_status: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

const DashboardBookingsPage = () => {
  const [error, setError] = useState<boolean>(false);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/${userId}`
      );
      const data: Booking[] = response.data.data;

      if (response.data.r === "s") {
        const upcoming = data.filter(
          (booking) => booking.status !== "completed"
        );
        const completed = data.filter(
          (booking) => booking.status === "completed"
        );

        setUpcomingBookings(upcoming);
        setCompletedBookings(completed);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(true);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-red-500 text-lg font-semibold">Error</div>
              <div className="text-gray-600">Failed to load bookings. Please try again.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBookings = upcomingBookings.length + completedBookings.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage your appointments and availability</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-lg font-semibold">{totalBookings}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">{upcomingBookings.length}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-500">{completedBookings.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Appointments scheduled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully conducted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingBookings.filter(booking => 
                new Date(booking.start_time).getMonth() === new Date().getMonth()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-blue-50 p-1">
          <TabsTrigger value="upcoming" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700">
            <Calendar className="h-4 w-4" />
            Upcoming
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                {upcomingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700">
            <User className="h-4 w-4" />
            Completed
            {completedBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                {completedBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700">
            <Clock className="h-4 w-4" />
            Set Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600">Your upcoming appointments will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking: Booking) => (
                    <BookingCard
                      key={booking._id}
                      profileImage="/default-profile.jpg"
                      name={booking.offering_id?.community_id?.name}
                      role={booking.offering_id?.type}
                      service={booking.offering_id?.title}
                      host={booking.provider_id?.name}
                      guest={booking?.client_id?.name}
                      bookedOn={new Date(booking?.start_time).toLocaleString()}
                      amount={booking.offering_id?.price?.amount}
                      status="upcoming"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {completedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed sessions</h3>
                  <p className="text-gray-600">Your completed appointments will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedBookings.map((booking: Booking) => (
                    <BookingCard
                      key={booking._id}
                      profileImage="/default-profile.jpg"
                      name={booking.offering_id?.community_id?.name}
                      role={booking.offering_id?.type}
                      service={booking.offering_id?.title}
                      host={booking.provider_id?.name}
                      guest={booking?.client_id?.name}
                      bookedOn={new Date(booking?.start_time).toLocaleString()}
                      amount={booking.offering_id?.price?.amount}
                      status="completed"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <Availablity userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardBookingsPage; 