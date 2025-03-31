"use client"

import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';

import Card from '@/components/payments/Card'
import RecentTransactions from '@/components/payments/RecentTransactions'

function Payments() {
  return (
    <div className='flex flex-col bg-[#F2F2F2] gap-16 px-20 mx-5 mt-6'>
      <div className='h-30 flex flex-row items-center gap-3'>
        <div><FaArrowLeft /></div>
        <h1 className="font-semibold text-2xl font-[Source Sans Pro] leading-7">Your Wallet</h1>
      </div>
      <div className="flex flex-col gap-10">
        <Card />
        <RecentTransactions />
      </div>
    </div>
  )
}

export default Payments