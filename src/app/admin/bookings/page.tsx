
"use client";

import { getBookings } from '@/lib/firebase';
import BookingsClientPage from './BookingsClientPage';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { Booking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


export default function BookingsPage() {
  const [initialBookings, setInitialBookings] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchInitialBookings = async () => {
        try {
            const bookings = await getBookings();
            setInitialBookings(bookings);
        } catch (error) {
            console.error("Error fetching initial bookings", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchInitialBookings();
  }, []);

  if(isLoading) {
    return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if(!initialBookings) {
    return <div>Não foi possível carregar os agendamentos.</div>
  }

  return (
    <div className="space-y-6">
        <BookingsClientPage initialBookings={initialBookings} />
    </div>
  );
}
