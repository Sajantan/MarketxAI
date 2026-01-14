import { TrendingUp, TrendingDown, Activity, BarChart3, Clock } from 'lucide-react';
import { StockData } from '@/hooks/useStockData';

interface StockCardProps {
  data: StockData;
}

export function StockCard({ data }: StockCardProps) {
  const isPositive = data.change >= 0;

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  return (
    <div className={`glass-card rounded-2xl p-6 ${isPositive ? 'glow-success' : 'glow-danger'}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold font-mono">{data.symbol}</h2>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${
              isPositive 
                ? 'bg-primary/20 text-primary' 
                : 'bg-destructive/20 text-destructive'
            }`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
            </span>
          </div>
          <p className="text-muted-foreground text-sm">{data.name}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-mono">${data.price.toFixed(2)}</p>
          <p className={`text-sm font-mono ${isPositive ? 'text-primary' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}{data.change.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Activity className="h-3 w-3" />
            Day Range
          </div>
          <p className="font-mono text-sm">
            ${data.dayLow.toFixed(2)} - ${data.dayHigh.toFixed(2)}
          </p>
        </div>

        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Clock className="h-3 w-3" />
            Prev Close
          </div>
          <p className="font-mono text-sm">${data.previousClose.toFixed(2)}</p>
        </div>

        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <BarChart3 className="h-3 w-3" />
            Volume
          </div>
          <p className="font-mono text-sm">{data.volume.toLocaleString()}</p>
        </div>

        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <TrendingUp className="h-3 w-3" />
            Market Cap
          </div>
          <p className="font-mono text-sm">{formatNumber(data.marketCap)}</p>
        </div>
      </div>

      {(data.fiftyTwoWeekHigh > 0 || data.fiftyTwoWeekLow > 0) && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">52 Week Range</span>
            <span className="font-mono">
              ${data.fiftyTwoWeekLow.toFixed(2)} - ${data.fiftyTwoWeekHigh.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
