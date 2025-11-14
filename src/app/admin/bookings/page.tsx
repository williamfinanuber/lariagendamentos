
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
                        <CardTitle className="text-xl md:text-2xl">Gerenciar Agendamentos</CardTitle>
                    </div>
                </div>
                <CardDescription className="text-sm pt-2">Confirme ou descarte os agendamentos solicitados. Use os filtros para encontrar agendamentos específicos.</CardDescription>
            </CardHeader>
        </Card>
        <BookingsClientPage initialBookings={initialBookings} />
    </div>
  );
}
