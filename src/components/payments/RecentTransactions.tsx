"use client"

import { RootState } from '@/redux/store';
import axios from 'axios';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface TableHeadingsProps {
  heading: string;
  className?: string;
}

interface CreatorPayment {
  _id: string;
  creatorId: string;
  rzp_paymentId: string;
  rzp_transferId?: string | null;
  amount: number;
  currency: string;
  onHold: boolean;
  onHoldUntil: number;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
}

interface GetCreatorPayoutsResponse {
  success: boolean;
  payouts: CreatorPayment[];
}

interface TransactionRowProps {
  transaction: CreatorPayment;
}

const TableHeadings: FC<TableHeadingsProps> = ({ heading, className }) => {
  return (
    <div className={className}>
      <h2 className='font-semibold text-base font-[Source Sans Pro] leading-5'>{heading}</h2>
    </div>
  );
}

const TransactionRow: FC<TransactionRowProps> = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-white">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="grid grid-cols-3 gap-4 w-full px-5 py-3 cursor-pointer md:cursor-default items-center md:hidden"
      >
        <div className="truncate">
          <p className='font-semibold text-sm leading-5 decoration-[#4A4A4A]'>
            {transaction.rzp_paymentId}
          </p>
        </div>
        <div className="text-center">
          <p className='font-normal text-sm leading-5 decoration-[#4A4A4A]'>
            ₹{(transaction.amount/100).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className='font-normal text-sm leading-5 decoration-[#4A4A4A]'>
            {transaction?.createdAt?.split('T')[0]}
          </p>
        </div>
      </div>

      <div 
        className={`md:hidden ${isExpanded ? 'block' : 'hidden'} px-5 py-3 bg-gray-50 border-t border-gray-100`}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold">Mode</p>
            <p className="text-sm">{transaction.currency}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Status</p>
            <p className="text-sm">{transaction.status}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Time</p>
            <p className="text-sm">{transaction?.createdAt?.split('T')[1].split('.')[0]}</p>
          </div>
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-6 md:gap-6 w-full h-10 px-5 py-3">
        <div className="truncate">
          <p className='font-semibold text-sm md:text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
            {transaction.rzp_paymentId}
          </p>
        </div>
        <div className="hidden md:block">
          <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
            {transaction.currency}
          </p>
        </div>
        <div className="text-center">
          <p className='font-normal text-sm md:text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
            ₹{(transaction.amount/100).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className='font-normal text-sm md:text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
            {transaction?.createdAt?.split('T')[0]}
          </p>
        </div>
        <div className="hidden md:block">
          <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
            {transaction?.createdAt?.split('T')[1].split('.')[0]}
          </p>
        </div>
        <div className="hidden md:block">
          <p className='font-semibold text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
            {transaction.status}
          </p>
        </div>
      </div>
    </div>
  );
};

const TransactionRowSkeleton = () => {
  return (
    <div className="border border-white animate-pulse">
      <div className="grid grid-cols-3 gap-4 w-full px-5 py-3 md:hidden">
        <div className="h-5 bg-gray-200 rounded-md"></div>
        <div className="h-5 bg-gray-200 rounded-md"></div>
        <div className="h-5 bg-gray-200 rounded-md"></div>
      </div>

      <div className="hidden md:grid md:grid-cols-6 md:gap-6 w-full h-10 px-5 py-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-5 bg-gray-200 rounded-md"></div>
        ))}
      </div>
    </div>
  );
};

const RecentTransactions: FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;
  const [data, setData] = useState<CreatorPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCreatorPayouts(userId: string): Promise<CreatorPayment[]> {
    try {
      const response = await axios.get<GetCreatorPayoutsResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/creator-payouts/${userId}`
      );
      if (response.data.success) {
        return response.data.payouts;
      } else {
        throw new Error("Failed to fetch creator payouts.");
      }
    } catch (error) {
      console.error("Error fetching creator payouts:", error);
      throw error;
    }
  }

  useEffect(() => {
    async function loadPayouts() {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await fetchCreatorPayouts(userId);
        setData(response)
      } catch (err) {
        setError("Failed to fetch payouts.");
      } finally {
        setLoading(false);
      }
    }
    loadPayouts();
  }, [userId]);

  if (loading) {
    return (
      <div>
        <div>
          <h1 className='font-semibold text-2xl font-[Source Sans Pro] leading-7'>Recent Transactions</h1>
        </div>
        <div className='mt-6'>
          <div className='grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 w-full rounded-t-md bg-card px-5 py-4'>
            <TableHeadings heading="Reference Id" />
            <TableHeadings heading="Mode" className="hidden md:block" />
            <TableHeadings heading="Amount" className="text-center" />
            <TableHeadings heading="Date" className="text-right" />
            <TableHeadings heading="Time" className="hidden md:block" />
            <TableHeadings heading="Status" className="hidden md:block" />
          </div>

          <div className="flex flex-col">
            {[...Array(5)].map((_, index) => (
              <TransactionRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <div>
      <div>
        <h1 className='font-semibold text-2xl font-[Source Sans Pro] leading-7'>Recent Transactions</h1>
      </div>
      <div className='mt-6'>
        <div className='grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 w-full rounded-t-md bg-card px-5 py-4'>
          <TableHeadings heading="Reference Id" />
          <TableHeadings heading="Mode" className="hidden md:block" />
          <TableHeadings heading="Amount" className="text-center" />
          <TableHeadings heading="Date" className="text-right" />
          <TableHeadings heading="Time" className="hidden md:block" />
          <TableHeadings heading="Status" className="hidden md:block" />
        </div>

        <div className="flex flex-col">
          {data.map((transaction) => (
            <TransactionRow key={transaction._id} transaction={transaction} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecentTransactions;
