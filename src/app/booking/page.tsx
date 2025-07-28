"use client";

import React, { useEffect, useState, useRef } from "react";
import BookingCard from "@/components/booking/BookingCard";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Availablity from "@/components/booking/Availablity";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const BookingPage = () => {
  const [error, setError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "completed" | "availability"
  >("upcoming");
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;
  const isCreator = user?.is_creator ? true : false;
  const [attendanceTracking, setAttendanceTracking] = useState<boolean>(false);

  const toastRef = useRef(false);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/${userId}`
      );
      const data: Booking[] = response.data.data;

      console.log("data", data);
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
    }
  };

  const handleAttendanceToggle = () => {
    setAttendanceTracking((prevState) => {
      const newState = !prevState;

      if (!toastRef.current) {
        toastRef.current = true;
        toast.success(`Attendance tracking is now ${newState ? "ON" : "OFF"}`);
      }

      return newState;
    });
  };

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  useEffect(() => {
    toastRef.current = false;
  }, [attendanceTracking]);

  if (error) {
    return <div>Error loading bookings....</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeButton
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FaArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-gray-200 mb-8">
          <button
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "upcoming"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Live Bookings
          </button>
          <button
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "completed"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Past Bookings
          </button>
          {isCreator && (
            <button
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "availability"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("availability")}
            >
              Availability
            </button>
          )}
        </div>

        {/* Attendance Toggle Button for Creators */}
        {isCreator && (
          <div className="mb-6">
            <button
              onClick={handleAttendanceToggle}
              className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-lg transition duration-200"
            >
              {attendanceTracking ? "Turn Off Attendance" : "Turn On Attendance"}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "availability" ? (
            <Availablity userId={userId} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(activeTab === "upcoming" ? upcomingBookings : completedBookings).map((booking: Booking) => (
                <BookingCard
                  key={booking._id}
                  profileImage="/default-profile.jpg"
                  name={booking.offering_id?.community_id?.name}
                  role={booking.offering_id?.type}
                  service={booking.offering_id?.title}
                  host={booking.provider_id?.name}
                  guest={booking?.client_id?.name}
                  bookedOn={booking?.start_time}
                  amount={booking.offering_id?.price?.amount || 0}
                  offeringName={booking.offering_id?.title}
                  offeringDescription={booking.offering_id?.description}
                  startTime={booking.start_time}
                  isLiveBooking={activeTab === "upcoming"}
                  meetingUrl={booking.offering_id?.meeting_url || booking.meeting_url}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {(activeTab === "upcoming" ? upcomingBookings : completedBookings).length === 0 && activeTab !== "availability" && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">No {activeTab === "upcoming" ? "live" : "past"} bookings</p>
                <p className="text-sm">You don't have any {activeTab === "upcoming" ? "upcoming" : "completed"} bookings yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
