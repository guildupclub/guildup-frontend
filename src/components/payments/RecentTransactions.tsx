import React, { FC } from 'react';

interface TableHeadingsProps {
  heading: string;
}

const TableHeadings: FC<TableHeadingsProps> = ({ heading }) => {
  return (
    <div>
      <h2 className='font-semibold text-base font-[Source Sans Pro] leading-5'>{heading}</h2>
    </div>
  );
}

const RecentTransactions: FC = () => {
  const data = [
    {
      "transaction_id": "985647393762011",
      "mode": "Razorpay",
      "amount": 1025,
      "date": "23-Jan-2023",
      "time": "5:59 PM",
      "status": "Paid"
    },
    {
      "transaction_id": "985647393762012",
      "mode": "UPI",
      "amount": 1500,
      "date": "24-Jan-2023",
      "time": "2:30 PM",
      "status": "Pending"
    },
    {
      "transaction_id": "985647393762013",
      "mode": "Credit Card",
      "amount": 500,
      "date": "22-Jan-2023",
      "time": "11:45 AM",
      "status": "Failed"
    },
    {
      "transaction_id": "985647393762014",
      "mode": "Net Banking",
      "amount": 2000,
      "date": "21-Jan-2023",
      "time": "9:10 AM",
      "status": "Paid"
    }
  ]

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
        {data.map((transaction) => {
          return (
            <div className='grid grid-cols-6 justify-between w-full h-10 border border-white px-5 py-3'>
              <div>
                <p className='font-semibold text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>{transaction.transaction_id}</p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>{transaction.mode}</p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
                  {transaction.amount}
                </p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
                  {transaction.date}
                </p>
              </div>
              <div>
                <p className='font-normal text-base font-[Source Sans Pro] leading-5 decoration-[#4A4A4A]'>
                  {transaction.time}
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
