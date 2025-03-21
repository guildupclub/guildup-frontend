"use client"

import { RootState } from '@/redux/store';
import axios from 'axios';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface TableHeadingsProps {
  heading: string;
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
const TableHeadings: FC<TableHeadingsProps> = ({ heading }) => {
  return (
    <div>
      <h2 className='font-semibold text-base font-[Source Sans Pro] leading-5'>{heading}</h2>
    </div>
  );
}

const RecentTransactions: FC = () => {
  const [data, setData] = useState<any>([])

  async function fetchCreatorPayouts(userId: string): Promise<CreatorPayment[]> {
    try {
      // const response = await axios.get<GetCreatorPayoutsResponse>(
      //   `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/creator-payouts/${userId}`
      // );
      const response = await axios.get<GetCreatorPayoutsResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/creator-payouts/67d28d151dae9f0a132809a9`
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

  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;
  const [payouts, setPayouts] = useState<CreatorPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div>
        <h1 className='font-semibold text-2xl font-[Source Sans Pro] leading-7'>Recent Transactions</h1>
      </div>
      <div className='mt-6'>
        <div className='grid grid-cols-6 justify-between w-full rounded-t-md bg-card px-5 py-4'>
          <TableHeadings heading={"Transaction ID"} />
          <TableHeadings heading={"Mode"} />
          <TableHeadings heading={"Amount"} />
          <TableHeadings heading={"Date"} />
          <TableHeadings heading={"Time"} />
          <TableHeadings heading={"Status"} />
        </div>
        {data.map((transaction: CreatorPayment) => {
          return (
            <div key={transaction._id} 
            className='grid grid-cols-6 justify-between w-full h-10 border border-white px-5 py-3'>
              <div>
                <p className='font-semibold text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>{transaction.rzp_paymentId}</p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>{transaction.currency}</p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>   {transaction.amount}   </p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>   {transaction?.createdAt?.split('T')[0]}   </p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>   {transaction?.createdAt?.split('T')[1].split('.')[0]}   </p>
              </div>
              <div>
                <p className='font-semibold text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>   {transaction.status}   </p>
              </div>
            </div>
          )
        })}

      </div>
    </div>
  );
}

export default RecentTransactions;
