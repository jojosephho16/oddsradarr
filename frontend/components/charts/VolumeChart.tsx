"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

interface VolumeChartProps {
  data: Array<{
    timestamp: string;
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
    const timestamp = new Date(now - i * 3600 * 1000).toISOString();
    const value = 50000 + Math.random() * 150000;
    data.push({ timestamp, value });
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
        <p className="text-sm font-medium text-accent-volume">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function VolumeChart({
  data,
  title = "Volume (24h)",
  loading = false,
}: VolumeChartProps) {
  const chartData = data.length > 0 ? data : generateMockData();

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent-volume" />
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
          <BarChart3 className="h-4 w-4 text-accent-volume" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8BE9FD" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
