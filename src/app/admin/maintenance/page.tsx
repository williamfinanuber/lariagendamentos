
"use client";

import { getBookings } from '@/lib/firebase';
import type { Booking } from '@/lib/types';
import MaintenanceClientPage from './MaintenanceClientPage';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MaintenancePage() {
  const [completedBookings, setCompletedBookings] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        const allBookings = await getBookings();
        const filteredBookings = allBookings.filter(
          (booking: Booking) => booking.status === 'completed' && !booking.maintenanceReminderSent
        );
        setCompletedBookings(filteredBookings);
      } catch (error) {
        console.error("Error fetching maintenance data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaintenanceData();
  }, []);

  if (isLoading) {
    return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!completedBookings) {
    return <div>Não foi possível carregar os dados de manutenção.</div>;
  }
  
  return (
    <div className="space-y-6">
       <div className="flex justify-start">
            <Button asChild variant="outline">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Link>
            </Button>
        </div>
      <MaintenanceClientPage completedBookings={completedBookings} />
    </div>
  );
}
