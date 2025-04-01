"use client"

import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import Card from '@/components/payments/Card'
import RecentTransactions from '@/components/payments/RecentTransactions'

function Payments() {
  return (
    <div className='flex flex-col bg-[#F2F2F2] min-h-screen'>
      {/* Header with responsive padding */}
      <div className='fixed top-0 left-0 right-0 h-16 md:h-20 bg-white z-10'>
        <div className='flex items-center h-full px-4 md:px-20'>
          <FaArrowLeft className='cursor-pointer mr-3' />
          <h1 className="font-semibold text-xl md:text-2xl leading-7">Your Wallet</h1>
        </div>
      </div>

      {/* Main content with proper spacing */}
      <div className='flex flex-col gap-8 md:gap-16 px-4 md:px-20 mt-20 md:mt-24 pb-16'>
        {/* Card and Transactions container */}
        <div className="flex flex-col gap-6 md:gap-10">
          <Card />
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}

export default Payments