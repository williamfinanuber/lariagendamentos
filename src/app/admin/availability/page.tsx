
"use client";

import { useState, useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Calendar, Loader2, ArrowLeft, Clock, Calendar as CalendarIcon, Check } from "lucide-react";
import { getAvailabilitySettings, updateAvailabilitySettings, getAvailability, getBlockedSlots, updateBlockedSlots } from "@/lib/firebase";
import type { AvailabilitySettings, BlockedSlot, Availability } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function AvailabilityPage() {
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null);
  const [availability, setAvailability] = useState<Availability>({});
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [isBlocking, setIsBlocking] = useState(false);
  
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, availabilityData, blockedSlotsData] = await Promise.all([
        getAvailabilitySettings(),
        getAvailability(),
        getBlockedSlots()
      ]);
      setSettings(settingsData);
      setAvailability(availabilityData);
      setBlockedSlots(blockedSlotsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [toast]);

  const handleToggle = async (isToggled: boolean, field: 'saturdayScheduling' | 'sundayScheduling') => {
    if (!settings) return;
    setIsSaving(prev => ({ ...prev, [field]: true }));
    try {
        const newSettings = { [field]: isToggled };
        await updateAvailabilitySettings(newSettings);
        setSettings(prev => prev ? { ...prev, ...newSettings } : null);
        
        const day = field === 'saturdayScheduling' ? 'sábado' : 'domingo';
        toast({
            title: isToggled ? `Agenda de ${day} ativada!` : `Agenda de ${day} desativada.`,
            description: isToggled ? `Agora você pode receber agendamentos aos ${day}s.` : `Os ${day}s não estarão mais disponíveis para agendamento.`
        });
        await fetchData(); // Refresh all availability data
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
        toast({ title: "Erro ao salvar alteração", variant: "destructive" });
    } finally {
        setIsSaving(prev => ({ ...prev, [field]: false }));
    }
  };

  const { slotsForSelectedDate, previouslyBlocked } = useMemo(() => {
    if (!selectedDate) return { slotsForSelectedDate: [], previouslyBlocked: [] };
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    
    // Get all potential slots for that day if it were available
    const baseSlots = availability[dateKey] || [];

    // Get slots that are already blocked for that day
    const blockedForDate = blockedSlots.find(b => b.id === dateKey);
    const previouslyBlockedTimes = blockedForDate ? blockedForDate.times : [];

    // Combine them, ensuring no duplicates and sort them
    const allSlots = [...new Set([...baseSlots, ...previouslyBlockedTimes])].sort((a,b) => a.localeCompare(b));

    return { slotsForSelectedDate: allSlots, previouslyBlocked: previouslyBlockedTimes };
  }, [selectedDate, availability, blockedSlots]);


  const [selectedToBlock, setSelectedToBlock] = useState<string[]>([]);
  
  useEffect(() => {
    setSelectedToBlock(previouslyBlocked);
  }, [previouslyBlocked]);

  const handleSlotToggle = (slot: string) => {
    setSelectedToBlock(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };
  
  const handleSaveBlock = async () => {
    if (!selectedDate) return;
    setIsBlocking(true);

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      await updateBlockedSlots(dateKey, selectedToBlock);
      toast({ title: "Horários atualizados!", description: "Os horários selecionados foram bloqueados/desbloqueados." });
      await fetchData(); // Refresh all data
    } catch (error) {
       console.error("Error blocking slots:", error);
       toast({ title: "Erro ao bloquear horários", variant: "destructive" });
    } finally {
        setIsBlocking(false);
    }
  }
  
  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
           <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                  <Link href="/admin">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                  </Link>
              </Button>
              <CardTitle className="text-xl md:text-2xl">
                  Configurações de Disponibilidade
              </CardTitle>
          </div>
          <CardDescription className="pt-2 text-sm md:text-base">
            Gerencie os dias e horários da sua agenda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Abrir agenda aos Sábados</p>
                    <p className="text-sm text-muted-foreground">
                       {settings.saturdayScheduling ? "Sua agenda está aberta para agendamentos aos sábados." : "Sua agenda está fechada aos sábados."}
                    </p>
                </div>
                <Switch
                    checked={settings.saturdayScheduling}
                    onCheckedChange={(isToggled) => handleToggle(isToggled, 'saturdayScheduling')}
                    disabled={isSaving['saturdayScheduling']}
                    aria-readonly
                />
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Abrir agenda aos Domingos</p>
                    <p className="text-sm text-muted-foreground">
                       {settings.sundayScheduling ? "Sua agenda está aberta para agendamentos aos domingos." : "Sua agenda está fechada aos domingos."}
                    </p>
                </div>
                <Switch
                    checked={settings.sundayScheduling}
                    onCheckedChange={(isToggled) => handleToggle(isToggled, 'sundayScheduling')}
                    disabled={isSaving['sundayScheduling']}
                    aria-readonly
                />
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Bloquear Horários Específicos</CardTitle>
          <CardDescription>
            Selecione uma data e marque os horários que deseja tornar indisponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center">
                 <ShadCalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={ptBR}
                    className="rounded-md border"
                  />
            </div>
            <div>
              {selectedDate ? (
                <div className="space-y-4">
                   <h3 className="font-semibold text-lg">
                      Horários para {format(selectedDate, "dd/MM/yyyy")}
                   </h3>
                   {slotsForSelectedDate.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slotsForSelectedDate.map(slot => (
                            <div key={slot} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`slot-${slot}`}
                                    checked={selectedToBlock.includes(slot)}
                                    onCheckedChange={() => handleSlotToggle(slot)}
                                />
                                <label
                                    htmlFor={`slot-${slot}`}
                                    className={cn(
                                        "text-sm font-medium leading-none",
                                        previouslyBlocked.includes(slot) && !selectedToBlock.includes(slot) && "text-green-600 line-through",
                                        !previouslyBlocked.includes(slot) && selectedToBlock.includes(slot) && "text-red-600"
                                    )}
                                >
                                    {slot}
                                </label>
                            </div>
                        ))}
                    </div>
                   ) : <p className="text-sm text-muted-foreground">Nenhum horário de trabalho configurado para este dia.</p>}
                   <div className="flex justify-end gap-2 items-center">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-3 w-3 bg-red-600 rounded-sm"></div>
                            <span>Bloquear</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-3 w-3 bg-green-600 rounded-sm"></div>
                            <span>Desbloquear</span>
                        </div>
                   </div>
                   <Button onClick={handleSaveBlock} disabled={isBlocking} className="w-full">
                    {isBlocking && <Loader2 className="mr-2 animate-spin"/>}
                    Salvar Bloqueios
                   </Button>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Selecione uma data no calendário.</p>
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
