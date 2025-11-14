
"use client";

import { getBookings } from '@/lib/firebase';
import type { Booking } from '@/lib/types';
import MaintenanceClientPage from './MaintenanceClientPage';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                            <Link href="/admin">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar
                            </Link>
                        </Button>
                        <CardTitle className="text-xl md:text-2xl">Manutenção e Configurações</CardTitle>
                    </div>
                </div>
                 <CardDescription className="text-sm pt-2">Execute ações de manutenção e gerencie configurações avançadas do sistema.</CardDescription>
            </CardHeader>
        </Card>
      <MaintenanceClientPage completedBookings={completedBookings} />
    </div>
  );
}
