"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

interface OIChartProps {
  data: Array<{
    time: string;
    value: number;
  }>;
  title?: string;
  loading?: boolean;
}

// Generate mock data for demo
function generateMockData() {
  const data = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now - i * 3600 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const value = 1000000 + Math.random() * 500000 + (24 - i) * 20000;
    data.push({ time, value });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground">
          {new Date(label).toLocaleString()}
        </p>
        <p className="text-sm font-medium text-accent-bullish">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function OIChart({ data, title = "Open Interest", loading = false }: OIChartProps) {
  const chartData = data.length > 0 ? data : generateMockData();

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent-bullish" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent-bullish" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="oiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#50FA7B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#50FA7B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F45" />
              <XAxis
                dataKey="time"
                stroke="#8B92A5"
                fontSize={10}
              />
              <YAxis
                stroke="#8B92A5"
                fontSize={10}
                tickFormatter={(value) =>
                  `$${(value / 1000000).toFixed(1)}M`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#50FA7B"
                fill="url(#oiGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
