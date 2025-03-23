'use client';

import React from 'react';
import { Button } from '../ui/button';

interface BookingCardProps {
  profileImage: string;
  name: string;
  role: string;
  service: string;
  host: string;
  guest: string;
  bookedOn: string;
  amount: number;
}

const BookingCard: React.FC<BookingCardProps> = ({
  profileImage,
  name,
  role,
  service,
  host,
  guest,
  bookedOn,
  amount,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 gap-3 flex flex-col w-full border">
      <div className="flex items-center space-x-4">
        <img
          src={profileImage}
          alt={name}
          className="w-12 h-12 rounded-full object-cover bg-red-500"
        />
        <div className='flex flex-col'>
          <h3 className="text-lg font-semibold leading-[1.5] tracking-[1%] align-bottom">{name}</h3>
          <p className="font-sans font-normal text-base leading-[1.5] tracking-[1%] align-bottom">{role}</p>
        </div>
      </div>
      <div className="mt-4 text-sm gap-2 flex flex-row justify-between">
        <div className='flex flex-col gap-2'>
          <div className="flex flex-col">
            <p className="text-lg font-semibold leading-[1.5] tracking-[1%] align-bottom">Service</p>
            <p className="font-sans font-normal text-base leading-[1.5] tracking-[1%] align-bottom">{service}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold leading-[1.5] tracking-[1%] align-bottom">Host by</p>
            <p className="font-sans font-normal text-base leading-[1.5] tracking-[1%] align-bottom">{host}</p>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <div className="flex flex-col items-end">
            <p className="text-lg font-semibold leading-[1.5] tracking-[1%] align-bottom">Guest</p>
            <p className="font-sans font-normal text-base leading-[1.5] tracking-[1%] align-bottom">{guest}</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg font-semibold leading-[1.5] tracking-[1%] align-bottom">Booked on</p>
            <p className="font-sans font-normal text-base leading-[1.5] tracking-[1%] align-bottom">{bookedOn}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="font-bold">Amount: ₹{amount}</p>
        <div className="space-x-4">
          <button className="w-[80px] h-[40px] md:w-[120px] md:h-[42px] rounded-lg border border-[#334BFF] py-2 px-3 animate-[ease-in_300ms] text-center">Cancel</button>
          <button className="md:w-[120px] md:h-[42px] rounded-lg border bg-[#334BFF] text-white py-2 px-3 animate-[ease-in_300ms] text-center">Reschedule</button>
          {/* <Button className='bg-card '>Cancel</Button>
          <Button>Reschedule</Button> */}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
