
"use client";

import { getTransactions, getCategories, getBookings } from '@/lib/firebase';
import FinancePageClient from './FinancePageClient';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { Transaction, Category, Booking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function FinancePage() {
  const [financeData, setFinanceData] = useState<{
    transactions: Transaction[];
    categories: Category[];
    bookings: Booking[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const [initialTransactions, initialCategories, initialBookings] = await Promise.all([
          getTransactions(),
          getCategories(),
          getBookings(),
        ]);
        setFinanceData({
          transactions: initialTransactions,
          categories: initialCategories,
          bookings: initialBookings,
        });
      } catch (error) {
        console.error("Error fetching finance data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFinanceData();
  }, []);

  if (isLoading) {
    return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!financeData) {
    return <div>Não foi possível carregar os dados financeiros.</div>;
  }

  return (
    <div className="space-y-6">
        <FinancePageClient 
        initialTransactions={financeData.transactions} 
        initialCategories={financeData.categories}
        initialBookings={financeData.bookings}
        />
    </div>
  );
}
