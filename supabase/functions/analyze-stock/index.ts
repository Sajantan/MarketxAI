import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, stockData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert stock market analyst and financial advisor. Analyze the provided stock data and give a comprehensive analysis including:

1. **Current Status**: Brief overview of current price and today's movement
2. **Technical Analysis**: Based on the price movement, volume, and market cap
3. **AI Prediction**: Short-term (1 week) and medium-term (1 month) price prediction with confidence level
4. **Risk Assessment**: Rate the risk level (Low/Medium/High) with explanation
5. **Recommendation**: Clear BUY, HOLD, or SELL recommendation with reasoning

Keep your response concise but informative. Use bullet points where appropriate. Be specific with numbers and percentages.

IMPORTANT: Always include a disclaimer that this is AI-generated analysis and not financial advice.`;

    const userMessage = `Analyze this stock:
Symbol: ${symbol}
Current Price: $${stockData.price}
Change: ${stockData.change} (${stockData.changePercent}%)
Day High: $${stockData.dayHigh}
Day Low: $${stockData.dayLow}
Previous Close: $${stockData.previousClose}
Volume: ${stockData.volume?.toLocaleString() || 'N/A'}
Market Cap: $${stockData.marketCap ? (stockData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
52 Week High: $${stockData.fiftyTwoWeekHigh || 'N/A'}
52 Week Low: $${stockData.fiftyTwoWeekLow || 'N/A'}
Company Name: ${stockData.name || symbol}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in analyze-stock:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
