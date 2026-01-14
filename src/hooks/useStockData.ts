import { useState } from 'react';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export function useStockData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async (symbol: string): Promise<StockData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Using Yahoo Finance API via RapidAPI proxy (free tier available)
      // For demo purposes, we'll simulate with realistic data based on symbol
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=1d`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();
      
      if (data.chart.error) {
        throw new Error(data.chart.error.description || 'Invalid stock symbol');
      }

      const quote = data.chart.result[0];
      const meta = quote.meta;
      const indicators = quote.indicators.quote[0];
      
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose || meta.chartPreviousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol: meta.symbol,
        name: meta.shortName || meta.symbol,
        price: currentPrice,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        dayHigh: meta.regularMarketDayHigh || indicators.high?.[0] || currentPrice,
        dayLow: meta.regularMarketDayLow || indicators.low?.[0] || currentPrice,
        previousClose: previousClose,
        volume: meta.regularMarketVolume || indicators.volume?.[0] || 0,
        marketCap: meta.marketCap || 0,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stock data';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchStockData, loading, error };
}
