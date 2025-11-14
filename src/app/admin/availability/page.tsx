
"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Calendar, Loader2, ArrowLeft } from "lucide-react";
import { getAvailabilitySettings, updateAvailabilitySettings } from "@/lib/firebase";
import type { AvailabilitySettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function AvailabilityPage() {
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const data = await getAvailabilitySettings();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching availability settings:", error);
        toast({ title: "Erro ao carregar configurações", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
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
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
        toast({ title: "Erro ao salvar alteração", variant: "destructive" });
    } finally {
        setIsSaving(prev => ({ ...prev, [field]: false }));
    }
  };
  
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
            Sua agenda funciona de Segunda a Sexta por padrão. Use as opções abaixo para gerenciar os finais de semana.
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
    </div>
  );
}
