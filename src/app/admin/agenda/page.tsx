
"use client";

import { getBookings, getProcedures, getAvailability } from '@/lib/firebase';
import AgendaView from './AgendaView';
import type { Booking, Procedure, Availability } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function AgendaData() {
  const [data, setData] = useState<{bookings: Booking[], procedures: Procedure[], availability: Availability} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allBookings, procedures, availability] = await Promise.all([
          getBookings(),
          getProcedures(),
          getAvailability()
        ]);
        const filteredBookings = allBookings.filter((booking: Booking) => booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'completed');
        setData({ bookings: filteredBookings, procedures, availability });
      } catch (error) {
        console.error("Failed to fetch agenda data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!data) {
    return <div>Não foi possível carregar os dados da agenda.</div>;
  }

  return <AgendaView initialBookings={data.bookings} procedures={data.procedures} initialAvailability={data.availability} />;
}

export default function AgendaPage() {
  
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
                        <CardTitle className="text-xl md:text-2xl">Agenda de Clientes</CardTitle>
                    </div>
                </div>
                 <CardDescription className="text-sm pt-2">Visualize e gerencie todos os seus agendamentos, confirme os pendentes ou adicione novos manualmente.</CardDescription>
            </CardHeader>
        </Card>
        <AgendaData />
    </div>
  );
}
