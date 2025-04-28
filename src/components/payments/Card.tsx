"use client";

import * as React from "react";
import {
  Wallet,
  Building2,
  DollarSign,
  BanknoteIcon,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import BankDetails from "./BankDetails";
import type { RootState } from "@/redux/store";

const Dashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [data, setData] = React.useState<any>({
    balance: 0,
    lifetimeEarnings: 0,
    withdrawnAmount: 0,
  });
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  async function fetchCreatorPayouts(userId: string) {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/creator-payouts/${userId}`
      );
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error("Failed to fetch creator payouts.");
      }
    } catch (error) {
      console.error("Error fetching creator payouts:", error);
      throw error;
    }
  }

  React.useEffect(() => {
    async function loadPayouts() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetchCreatorPayouts(userId);
        setData(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch payouts.");
      } finally {
        setLoading(false);
      }
    }
    loadPayouts();
  }, [userId]);

  // Format currency values
  const formatCurrency = (value: number | string) => {
    if (value === undefined || value === null) return "₹0";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  if (error) {
    return (
      <div className="w-full p-6 text-center">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchCreatorPayouts(userId)
                  .then((data) => {
                    setData(data);
                    setLoading(false);
                  })
                  .catch(() => {
                    setError("Failed to fetch payouts.");
                    setLoading(false);
                  });
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 bg-gradient-to-b from-slate-50 to-white">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-800">
        Financial Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Balance Card */}
        <Card className="overflow-hidden border-slate-200 transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2 pt-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium text-slate-600">
                Available Balance
              </CardTitle>
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-28 mt-2" />
            ) : (
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(data?.balance)}
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <p className="text-xs text-slate-500">Available for withdrawal</p>
          </CardFooter>
        </Card>

        {/* Lifetime Earning Card */}
        <Card className="overflow-hidden border-slate-200 transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2 pt-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium text-slate-600">
                Lifetime Earnings
              </CardTitle>
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-28 mt-2" />
            ) : (
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(data?.lifetimeEarnings)}
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <p className="text-xs text-slate-500">Total earnings to date</p>
          </CardFooter>
        </Card>

        {/* Withdrawal Card */}
        <Card className="overflow-hidden border-slate-200 transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2 pt-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium text-slate-600">
                Total Withdrawn
              </CardTitle>
              <BanknoteIcon className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-28 mt-2" />
            ) : (
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(data?.withdrawnAmount)}
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <p className="text-xs text-slate-500">Successfully processed</p>
          </CardFooter>
        </Card>

        {/* Bank Details Card */}
        <Card className="overflow-hidden border-slate-200 transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2 pt-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium text-slate-600">
                Bank Details
              </CardTitle>
              <Building2 className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100%-80px)] justify-end">
            {loading ? (
              <Skeleton className="h-10 w-full mt-2" />
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span>Update Bank Details</span>
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <BankDetails onClose={() => setIsDialogOpen(false)} />
              </Dialog>
            )}
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <p className="text-xs text-slate-500">For receiving payments</p>
          </CardFooter>
        </Card>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
            <p className="text-slate-700">Loading financial data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
