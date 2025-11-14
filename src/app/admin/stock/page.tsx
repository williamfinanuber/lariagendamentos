
"use client";

import { getProducts, getStockCategories } from '@/lib/firebase';
import StockClientPage from './StockClientPage';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { Product, StockCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/card';

export default function StockPage() {
  const [stockData, setStockData] = useState<{
    products: Product[];
    categories: StockCategory[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const [initialProducts, initialCategories] = await Promise.all([
          getProducts(),
          getStockCategories(),
        ]);
        setStockData({ products: initialProducts, categories: initialCategories });
      } catch (error) {
        console.error("Error fetching stock data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStockData();
  }, []);

  if (isLoading) {
    return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!stockData) {
    return <div>Não foi possível carregar os dados de estoque.</div>;
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                 <div className="pb-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>
                </div>
            </CardHeader>
        </Card>
        <StockClientPage 
        initialProducts={stockData.products} 
        initialCategories={stockData.categories}
        />
    </div>
  );
}
