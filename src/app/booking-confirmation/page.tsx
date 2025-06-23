'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Booking {
  _id: string;
  offering_id?: {
    title?: string;
    duration?: number;
    price?: {
      amount?: number;
      currency?: string;
    };
  } | string; // in case it's an ID
  start_time?: string;
  provider_id?: {
    name?: string;
  };
}

export default function BookingConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError(true);
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/${bookingId}`)
      .then((res) => {
        if (res.data?.r === 's') {
          console.log("Booking API response:", res.data.data);
          setBooking(res.data.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [bookingId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600 font-semibold text-center p-4">
        Booking not found or failed to load.
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600 font-medium text-center p-4">
        Loading booking details...
      </div>
    );
  }
  const serviceTitle =
    typeof booking.offering_id === 'object' && booking.offering_id?.title
      ? booking.offering_id.title
      : 'N/A';
  
  const duration =
    typeof booking.offering_id === 'object' && booking.offering_id?.duration
      ? booking.offering_id.duration
      : 'N/A';
  
  const price =
    typeof booking.offering_id === 'object' && booking.offering_id?.price?.amount
      ? booking.offering_id.price.amount
      : 0;
  
  const currency =
    typeof booking.offering_id === 'object' && booking.offering_id?.price?.currency
      ? booking.offering_id.price.currency
      : 'INR';

  const dateTime = booking?.start_time ? new Date(booking.start_time) : null;
  
  const formattedDate = dateTime
    ? dateTime.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';
  
  const formattedTime = dateTime
    ? dateTime.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white max-w-md w-full p-6 rounded-lg shadow-md text-center">
        <div className="text-green-500 text-4xl mb-2">✅</div>
        <h2 className="text-xl font-semibold mb-2">Booking Confirmed!</h2>
        <p className="text-gray-700 mb-6">
          Your booking has been successfully confirmed. You’ve been registered and can now access your bookings.
        </p>

        <div className="bg-gray-50 border rounded-lg p-4 text-left text-sm space-y-3">
          <div><strong>Service Name:</strong> {serviceTitle}</div>
          <div><strong>Date:</strong> {formattedDate}</div>
          <div><strong>Time:</strong> {formattedTime}</div>
          <div><strong>Duration:</strong> {duration} minutes</div>
          <div><strong>Price:</strong> {currency} {price}</div>
        </div>



        <button
          onClick={() => router.push('/booking')}
          className="mt-6 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Go to My Bookings
        </button>
      </div>
    </div>
  );
}
