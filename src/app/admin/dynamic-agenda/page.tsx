
"use client";

import { getBookings } from '@/lib/firebase';
import type { Booking } from '@/lib/types';
import DynamicAgendaView from './DynamicAgendaView';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DynamicAgendaPage() {
  const [initialBookings, setInitialBookings] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialBookings = useCallback(async () => {
    setIsLoading(true);
    try {
        const bookings = await getBookings();
        setInitialBookings(bookings);
    } catch (error) {
        console.error("Error fetching initial bookings", error);
        setInitialBookings([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialBookings();
  }, [fetchInitialBookings]);

  if(isLoading && !initialBookings) { // Show loading only on initial load
    return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if(!initialBookings) {
    return <div>Não foi possível carregar os agendamentos.</div>
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
                        <CardTitle className="text-xl md:text-2xl">Agenda Dinâmica</CardTitle>
                    </div>
                </div>
                <CardDescription className="text-sm pt-2">
                    Clique em um agendamento para marcá-lo como atendido ou para cancelá-lo.
                </CardDescription>
            </CardHeader>
        </Card>
       <DynamicAgendaView initialBookings={initialBookings} onBookingUpdate={fetchInitialBookings} />
    </div>
  );
}
