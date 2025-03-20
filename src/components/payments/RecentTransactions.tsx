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
  let data:any = [
    // {
    //   "transaction_id": "985647393762011",
    //   "mode": "Razorpay",
    //   "amount": 1025,
    //   "date": "23-Jan-2023",
    //   "time": "5:59 PM",
    //   "status": "Paid"
    // },
    // {
    //   "transaction_id": "985647393762012",
    //   "mode": "UPI",
    //   "amount": 1500,
    //   "date": "24-Jan-2023",
    //   "time": "2:30 PM",
    //   "status": "Pending"
    // },
    // {
    //   "transaction_id": "985647393762013",
    //   "mode": "Credit Card",
    //   "amount": 500,
    //   "date": "22-Jan-2023",
    //   "time": "11:45 AM",
    //   "status": "Failed"
    // },
    // {
    //   "transaction_id": "985647393762014",
    //   "mode": "Net Banking",
    //   "amount": 2000,
    //   "date": "21-Jan-2023",
    //   "time": "9:10 AM",
    //   "status": "Paid"
    // }
  ]

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
        data= response;
      } catch (err) {
        setError("Failed to fetch payouts.");
      } finally {
        setLoading(false);
      }
    }
    loadPayouts();
  }, [userId]);
  
  async function fetchTransactions(){
    try {
      const response= await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/creator-payouts/${userId}`);
      data= response.data.payouts
    } catch (error) {
      console.error("Error in fetching transactions ", error)
    }
  }

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
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
                  {transaction.amount}
                </p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
                  {transaction.createdAt}
                </p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
                  {transaction.createdAt}
                </p>
              </div>
              <div>
                <p className='font-semibold text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
                  {transaction.status}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default RecentTransactions;
