"use client";

import * as React from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Clock, RefreshCcw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RootState } from "@/redux/store";

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

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Format date and time
  const dateTime = new Date(transaction.createdAt);
  const formattedDate = format(dateTime, "MMM dd, yyyy");
  const formattedTime = format(dateTime, "hh:mm a");

  // Format amount
  const formattedAmount = `₹${(transaction.amount / 100).toFixed(2)}`;

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
          >
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 hover:bg-red-200"
          >
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden border-b border-slate-100 hover:bg-slate-50">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="grid grid-cols-3 gap-4 w-full px-4 py-3 cursor-pointer items-center"
        >
          <div className="truncate">
            <p className="font-medium text-sm text-slate-900">
              {transaction.rzp_paymentId.substring(0, 10)}...
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-900 font-medium">
              {formattedAmount}
            </p>
          </div>
          <div className="text-right flex items-center justify-end gap-1">
            <p className="text-sm text-slate-600">{formattedDate}</p>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs ">Mode</p>
                <p className="text-sm font-medium">{transaction.currency}</p>
              </div>
              <div>
                <p className="text-xs ">Status</p>
                <div className="pt-1">{getStatusBadge(transaction.status)}</div>
              </div>
              <div>
                <p className="text-xs ">Time</p>
                <p className="text-sm font-medium">{formattedTime}</p>
              </div>
              <div>
                <p className="text-xs ">Reference ID</p>
                <p className="text-sm font-medium truncate">
                  {transaction.rzp_paymentId}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <TableRow className="hidden md:table-row hover:bg-slate-50">
        <TableCell className="font-medium">
          <span className="text-sm text-muted">
            {transaction.rzp_paymentId}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {transaction.currency}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <span className="text-sm font-medium text-muted-foreground">
            {formattedAmount}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">{formattedTime}</span>
        </TableCell>
        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
      </TableRow>
    </>
  );
};

const TransactionRowSkeleton = () => {
  return (
    <>
      {/* Mobile Skeleton */}
      <div className="md:hidden border-b border-slate-100">
        <div className="grid grid-cols-3 gap-4 w-full px-4 py-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16 mx-auto" />
          <Skeleton className="h-5 w-20 ml-auto" />
        </div>
      </div>

      {/* Desktop Skeleton */}
      <TableRow className="hidden md:table-row">
        <TableCell>
          <Skeleton className="h-5 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-20 ml-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-20" />
        </TableCell>
      </TableRow>
    </>
  );
};

const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => {
  return (
    <div className="text-center py-12 px-4 border  border-slate-200 rounded-lg bg-slate-50">
      <Clock className="mx-auto h-12 w-12 text-slate-300" />
      <h3 className="mt-4 text-lg font-medium text-slate-900">
        No transactions yet
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Your recent transactions will appear here once you start receiving
        payments.
      </p>
      <Button variant="outline" className="mt-4 text-muted" onClick={onRefresh}>
        <RefreshCcw className="mr-2 h-4 w-4 text-muted" />
        Refresh
      </Button>
    </div>
  );
};

const RecentTransactions: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;
  const [data, setData] = React.useState<CreatorPayment[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCreatorPayouts = React.useCallback(
    async (userId: string): Promise<CreatorPayment[]> => {
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
    },
    []
  );

  const loadPayouts = React.useCallback(async () => {
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
  }, [userId, fetchCreatorPayouts]);

  React.useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-slate-800">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={loadPayouts}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-[250px]">Reference ID</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, index) => <TransactionRowSkeleton key={index} />)
                  ) : data.length > 0 ? (
                    data.map((transaction) => (
                      <TransactionRow
                        key={transaction._id}
                        transaction={transaction}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <EmptyState onRefresh={loadPayouts} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden">
              <div className="grid grid-cols-3 gap-4 w-full rounded-t-md bg-slate-50 px-4 py-3 border-b border-slate-200">
                <div className="text-xs font-medium ">Reference ID</div>
                <div className="text-xs font-medium text-center">Amount</div>
                <div className="text-xs font-medium  text-right">Date</div>
              </div>

              <div className="divide-y divide-slate-100">
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => <TransactionRowSkeleton key={index} />)
                ) : data.length > 0 ? (
                  data.map((transaction) => (
                    <TransactionRow
                      key={transaction._id}
                      transaction={transaction}
                    />
                  ))
                ) : (
                  <div className="py-4">
                    <EmptyState onRefresh={loadPayouts} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
