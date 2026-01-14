import { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertCircle } from 'lucide-react';
import { StockData } from '@/hooks/useStockData';
import { toast } from 'sonner';

interface AIAnalysisProps {
  stockData: StockData;
}

export function AIAnalysis({ stockData }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeStock = async () => {
      setLoading(true);
      setAnalysis('');
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-stock`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              symbol: stockData.symbol,
              stockData,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 429) {
            toast.error('Rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status === 402) {
            toast.error('Usage limit reached. Please add credits to continue.');
          }
          throw new Error(errorData.error || 'Failed to analyze stock');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setAnalysis((prev) => prev + content);
              }
            } catch {
              // Incomplete JSON, wait for more data
              buffer = line + '\n' + buffer;
              break;
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    analyzeStock();
  }, [stockData]);

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/20">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            AI Analysis
            {loading && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
          </h3>
          <p className="text-sm text-muted-foreground">Powered by AI</p>
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        {loading && !analysis && (
          <div className="space-y-3">
            <div className="h-4 animate-shimmer rounded w-full" />
            <div className="h-4 animate-shimmer rounded w-5/6" />
            <div className="h-4 animate-shimmer rounded w-4/6" />
            <div className="h-4 animate-shimmer rounded w-full" />
            <div className="h-4 animate-shimmer rounded w-3/4" />
          </div>
        )}

        {analysis && (
          <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
            {analysis.split('\n').map((line, i) => {
              // Handle headers
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <h4 key={i} className="text-primary font-semibold mt-4 mb-2">
                    {line.replace(/\*\*/g, '')}
                  </h4>
                );
              }
              // Handle bold text inline
              if (line.includes('**')) {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={i} className="mb-2">
                    {parts.map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={j} className="text-primary">
                            {part.replace(/\*\*/g, '')}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </p>
                );
              }
              // Handle bullet points
              if (line.startsWith('- ') || line.startsWith('• ')) {
                return (
                  <p key={i} className="mb-1 pl-4">
                    • {line.slice(2)}
                  </p>
                );
              }
              // Regular text
              return line.trim() ? <p key={i} className="mb-2">{line}</p> : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
