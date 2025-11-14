

"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, MessageSquare, Check, Loader2 } from 'lucide-react';
import type { Booking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { markReminderAsSent } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface RemindersClientPageProps {
  bookings: Booking[];
}

export default function RemindersClientPage({ bookings: initialBookings }: RemindersClientPageProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [tomorrow, setTomorrow] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const tomorrowDate = addDays(new Date(), 1);
    setTomorrow(format(tomorrowDate, 'yyyy-MM-dd'));
  }, []);

  const reminderMessage = (booking: Booking) => {
    return encodeURIComponent(
        `Olá, ${booking.clientName}! Tudo bem? ✨ Passando para lembrar com carinho do seu horário agendado conosco amanhã! Mal podemos esperar para te receber.\n\n` +
        `*Procedimento:* ${booking.procedureName}\n` +
        `*Data:* ${format(parseISO(booking.date), "dd 'de' MMMM", { locale: ptBR })} (Amanhã)\n` +
        `*Hora:* ${booking.time}\n\n` +
        `Por favor, confirme sua presença respondendo a esta mensagem. Se precisar remarcar, nos avise com o máximo de antecedência possível, ok? 😊\n\n` +
        `Até breve!\n`+
        `Studio Larissa Santos ❤️`
    );
  };

  const bookingsForTomorrow = useMemo(() => {
    if (!tomorrow) return [];
    return bookings.filter(booking => booking.date === tomorrow);
  }, [bookings, tomorrow]);

  const handleSendReminder = async (booking: Booking) => {
    setIsLoading(prev => ({ ...prev, [booking.id]: true }));
    try {
      await markReminderAsSent(booking.id);
      
      // Update local state to reflect the change immediately
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === booking.id ? { ...b, reminderSent: true } : b
        )
      );
      
      // Open WhatsApp
      const whatsappUrl = `https://wa.me/${booking.clientContact.replace(/\D/g, '')}?text=${reminderMessage(booking)}`;
      window.open(whatsappUrl, '_blank', 'noopener noreferrer');

    } catch (error) {
       console.error("Error sending reminder:", error);
       toast({ title: "Erro ao marcar lembrete como enviado", variant: "destructive" });
    } finally {
        setIsLoading(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl"><Bell/> Lembretes de Horário</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Envie lembretes para os clientes com agendamento confirmado para amanhã, dia {tomorrow ? format(parseISO(tomorrow), 'dd/MM/yyyy') : '...'}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-2 text-xs">Cliente</TableHead>
              <TableHead className="px-2 text-xs">Horário</TableHead>
              <TableHead className="px-2 text-xs">Procedimento</TableHead>
              <TableHead className="text-right px-2 text-xs">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingsForTomorrow.length > 0 ? (
              bookingsForTomorrow.map((booking) => {
                const isSent = booking.reminderSent === true;
                const loading = isLoading[booking.id];
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium text-xs p-2">{booking.clientName}</TableCell>
                    <TableCell className="font-medium text-xs p-2">{booking.time}</TableCell>
                    <TableCell className="text-xs p-2">{booking.procedureName}</TableCell>
                    <TableCell className="text-right p-2">
                      <Button
                        size="sm"
                        className={cn(
                          "text-xs h-8 px-2",
                          isSent 
                            ? "bg-gray-600 hover:bg-gray-700 cursor-not-allowed" 
                            : "bg-green-500 hover:bg-green-600"
                        )}
                        onClick={() => handleSendReminder(booking)}
                        disabled={isSent || loading}
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (isSent ? <Check className="mr-1.5 h-3 w-3" /> : <MessageSquare className="mr-1.5 h-3 w-3" />)}
                        {isSent ? 'Enviado' : 'Enviar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-sm md:text-base">
                  Nenhum agendamento confirmado para amanhã.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
