'use client';

import React, { useEffect, useState } from 'react';
import BookingCard from '@/components/booking/BookingCard';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

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
  const [error, setError]= useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const {user}= useSelector((state: RootState)=> state.user);
  const userId= user?._id;
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/${userId}`);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/67d05e56d43e443ee256c756`);
        const data: Booking[] = response.data.bookings;
        console.log("this is data ",data);
        
        if(response.data.success=== true){
          const upcoming = data.filter((booking) => booking.status !== 'completed');
          const completed = data.filter((booking) => booking.status === 'completed');
          
          setUpcomingBookings(upcoming);
          setCompletedBookings(completed);
        }else{
          setError(true)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, []);

  if(error){
    return (
      <div>Error loading bookings....</div>
    )
  }
  return (
    <div className="max-w-3xl pb-16">
      <div className='flex flex-col bg-[#F2F2F2] gap-6 px-4 md:px-20 md:mx-5 mt-20'>
        <div className='h-30 flex flex-row items-center gap-3'>
          <div><FaArrowLeft /></div>
          <h1 className="font-semibold text-2xl font-[Source Sans Pro] leading-7">Bookings</h1>
        </div>
        <div className="flex space-x-12">
          <button
            className={`pb-2 ${activeTab === 'upcoming' ? 'text-blue-600 border-blue-600 border-b-2' : 'text-gray-500'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`pb-2 ${activeTab === 'completed' ? 'text-blue-600 border-blue-600 border-b-2' : 'text-gray-500'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        <div className="space-y-4">
          {(activeTab === 'upcoming' ? upcomingBookings : completedBookings).map((booking: Booking) => (
            <BookingCard
            key={booking._id}
            profileImage='/default-profile.jpg'
            name={booking.provider_id.name}
            role={booking.offering_id.type}
            service={booking.offering_id.title}
            host={booking.provider_id.name}
            guest={booking.client_id}
            bookedOn={new Date(booking.start_time).toLocaleString()}
            amount={booking.offering_id.price.amount}
          />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
