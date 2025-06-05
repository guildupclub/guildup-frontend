"use client";

import React from "react";
import Card from "@/components/payments/Card";
import RecentTransactions from "@/components/payments/RecentTransactions";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, CreditCard } from "lucide-react";

const DashboardPaymentsPage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Wallet</h1>
          <p className="text-gray-600">Manage your earnings, transactions, and financial details</p>
        </div>
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">Your financial overview</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UICard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,400</div>
            <p className="text-xs text-muted-foreground">
              Ready to withdraw
            </p>
          </CardContent>
        </UICard>
        
        <UICard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹6,800</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </UICard>

        <UICard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹24,600</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </UICard>
      </div>

      {/* Main Financial Dashboard */}
      <div className="space-y-6">
        <UICard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Card />
          </CardContent>
        </UICard>

        <UICard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </UICard>
      </div>
    </div>
  );
};

export default DashboardPaymentsPage; 