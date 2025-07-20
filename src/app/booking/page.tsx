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
import { CalendarCheck, Calendar } from "lucide-react";

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
    community_id?: {
      name: string;
    };
  };
  provider_id: {
    _id: string;
    name: string;
    email: string;
  };
  client_id: {
    _id: string;
    name: string;
  };
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
    <div className="max-w-3xl pb-16 bg-white">
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeButton
      />

      <div className="flex flex-col w-[100vw] bg-white gap-6 px-4 md:px-20 md:mx-5 mt-20">
        <div className="h-30 flex flex-row items-center gap-3">
          <div className="text-blue-600">
            <FaArrowLeft /> 
          </div>
          <div className="flex flex-row justify-center item-center text-blue-600">
            <CalendarCheck className="w-6 h-6 mr-2"/>
          <span className="font-semibold text-2xl font-[Source Sans Pro] leading-7">
            Bookings
          </span>
          </div>
        </div>
        <div className="flex space-x-6 items-center">
          <button
            className={`pb-2 font-semibold ${
              activeTab === "upcoming"
                ? "text-blue-600 "
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Live Bookings
          </button>
          <button
            className={`pb-2 font-semibold ${
              activeTab === "completed"
                ? "text-blue-600 "
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Past Bookings
          </button>
          {isCreator && (
            <button
              className={`pb-2 font-semibold ${
                activeTab === "availability"
                  ? "text-blue-600 "
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
        <div className="flex flex-row gap-2 flex-wrap h-fit mt-6">
          {activeTab === "availability" ? (
            <Availablity userId={userId} />
          ) : (
            <>
              {(activeTab === "upcoming" ? upcomingBookings : completedBookings).length > 0 ? (
                (activeTab === "upcoming" ? upcomingBookings : completedBookings).map((booking: Booking) => (
                  <BookingCard
                    key={booking._id}
                    profileImage="/default-profile.jpg"
                    name={booking.offering_id?.community_id?.name || "Community"}
                    role={booking.offering_id?.type}
                    service={booking.offering_id?.title}
                    host={booking.provider_id?.name}
                    guest={booking?.client_id?.name || "Client"}
                    bookedOn={new Date(booking?.start_time).toLocaleString()}
                    amount={booking.offering_id?.price?.amount}
                    offeringName={booking.offering_id?.title}
                    offeringDescription={booking.offering_id?.description}
                    startTime={booking.start_time}
                    status={booking.status as "upcoming" | "completed" | "cancelled"}
                  />
                ))
              ) : (
                <div className="w-full text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  {activeTab === "upcoming" ? (
                    <>
                      <CalendarCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Live Bookings</h3>
                      <p className="text-gray-500">You don't have any upcoming bookings at the moment.</p>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Past Bookings</h3>
                      <p className="text-gray-500">You haven't completed any bookings yet.</p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
