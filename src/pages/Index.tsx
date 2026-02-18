import { useState } from 'react';
import { TrendingUp, Zap, Brain } from 'lucide-react';
import { StockSearch } from '@/components/StockSearch';
import { StockCard } from '@/components/StockCard';
import { AIAnalysis } from '@/components/AIAnalysis';
import { PriceChart } from '@/components/PriceChart';
import { useStockData, StockData } from '@/hooks/useStockData';
import { toast } from 'sonner';

const Index = () => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const { fetchStockData, loading, error } = useStockData();

  const handleSearch = async (symbol: string) => {
    const data = await fetchStockData(symbol);
    if (data) {
      setStockData(data);
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MarketxAI</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              Real-time Data
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
            Powered by YahooFinance
            <Brain className="h-4 w-4" />
            Powered by Advanced AI
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">MarketxAI</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Enter any stock symbol to get real-time data and AI-powered analysis with predictions
          </p>
        </div>

        <StockSearch onSearch={handleSearch} loading={loading} />

        {error && !loading && (
          <div className="max-w-2xl mx-auto mt-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-center">
            {error}
          </div>
        )}

        {stockData && !loading && (
          <div className="max-w-4xl mx-auto mt-12 space-y-6">
            <StockCard data={stockData} />
            <PriceChart data={stockData} />
            <AIAnalysis stockData={stockData} />
          </div>
        )}

        {!stockData && !loading && !error && (
          <div className="text-center mt-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary/50 mb-6">
              <TrendingUp className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Search for a Stock
            </h3>
            <p className="text-muted-foreground/70">
              Enter a stock symbol above to get started
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>
            ⚠️ AI predictions are for informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
