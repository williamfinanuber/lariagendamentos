
"use client";

import { getBookings } from '@/lib/firebase';
import type { Booking } from '@/lib/types';
import RemindersClientPage from './RemindersClientPage';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RemindersPage() {
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRemindersData = async () => {
      try {
        const allBookings = await getBookings();
        const filteredBookings = allBookings.filter((booking: Booking) => booking.status === 'confirmed');
        setConfirmedBookings(filteredBookings);
      } catch (error) {
        console.error("Error fetching reminders data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRemindersData();
  }, []);

  if (isLoading) {
    return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!confirmedBookings) {
    return <div>Não foi possível carregar os lembretes.</div>;
  }

  return (
    <div className="space-y-6">
       <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                        <Link href="/admin">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>
                    <CardTitle className="text-xl md:text-2xl">Lembretes de Horário</CardTitle>
                </div>
                <RemindersClientPage bookings={confirmedBookings} />
            </CardHeader>
        </Card>
    </div>
  );
}
