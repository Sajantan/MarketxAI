import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  loading: boolean;
}

const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'];

export function StockSearch({ onSearch, loading }: StockSearchProps) {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="pl-12 h-14 text-lg bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          disabled={!symbol.trim() || loading}
          className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analyze
            </div>
          )}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-muted-foreground mr-2">Popular:</span>
        {popularStocks.map((stock) => (
          <button
            key={stock}
            onClick={() => {
              setSymbol(stock);
              onSearch(stock);
            }}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-mono bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-lg border border-border/50 hover:border-primary/30 transition-all disabled:opacity-50"
          >
            {stock}
          </button>
        ))}
      </div>
    </div>
  );
}
