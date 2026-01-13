"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Percent } from "lucide-react";

interface ProbabilityChartProps {
  data: Array<{
    timestamp: string;
    probability: number;
  }>;
  title?: string;
  loading?: boolean;
  currentProbability?: number;
}

// Generate mock data for demo
function generateMockData(currentProb = 0.65) {
  const data = [];
  const now = Date.now();
  let prob = currentProb - 0.1;

  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600 * 1000).toISOString();
    prob = Math.max(0.1, Math.min(0.9, prob + (Math.random() - 0.5) * 0.03));
    if (i === 0) prob = currentProb;
    data.push({ timestamp, probability: prob });
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
        <p className="text-sm font-medium text-primary">
          {(payload[0].value * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function ProbabilityChart({
  data,
  title = "Probability",
  loading = false,
  currentProbability = 0.65,
}: ProbabilityChartProps) {
  const chartData =
    data.length > 0 ? data : generateMockData(currentProbability);

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <span className="text-lg font-bold text-primary">
            {(currentProbability * 100).toFixed(1)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F45" />
              <XAxis
                dataKey="timestamp"
                stroke="#8B92A5"
                fontSize={10}
                tickFormatter={(value) =>
                  new Date(value).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <YAxis
                stroke="#8B92A5"
                fontSize={10}
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0.5} stroke="#2A2F45" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="probability"
                stroke="#BD93F9"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#BD93F9" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
