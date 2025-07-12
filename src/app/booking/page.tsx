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
    <div className="max-w-3xl pb-16">
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeButton
      />

      <div className="flex flex-col bg-[#F2F2F2] gap-6 px-4 md:px-20 md:mx-5 mt-20">
        <div className="h-30 flex flex-row items-center gap-3">
          <div>
            <FaArrowLeft />
          </div>
          <h1 className="font-semibold text-2xl font-[Source Sans Pro] leading-7">
            Bookings
          </h1>
        </div>
        <div className="flex space-x-6 items-center">
          <button
            className={`pb-2 ${
              activeTab === "upcoming"
                ? "text-blue-600 border-blue-600 border-b-2"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`pb-2 ${
              activeTab === "completed"
                ? "text-blue-600 border-blue-600 border-b-2"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          {isCreator && (
            <button
              className={`pb-2 ${
                activeTab === "availability"
                  ? "text-blue-600 border-blue-600 border-b-2"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("availability")}
            >
              Availability
            </button>
          )}

          {/* Show Button Only When User is a Creator */}
          {isCreator && (
            <button
              onClick={handleAttendanceToggle}
              className="ml-6 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200"
            >
              {attendanceTracking
                ? "Turn Off Attendance"
                : "Turn On Attendance"}
            </button>
          )}
        </div>

        <div className="space-y-4 mt-6">
          {activeTab !== "availability" &&
            (activeTab === "upcoming"
              ? upcomingBookings
              : completedBookings
            ).map((booking: Booking) => (
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
              />
            ))}
          {activeTab === "availability" && <Availablity userId={userId} />}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
