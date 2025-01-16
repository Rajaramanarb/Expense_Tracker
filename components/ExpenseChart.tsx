"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ExpenseChartProps {
  data: {
    month: string;
    credit: number;
    debit: number;
  }[];
  trend: {
    percentage: number;
    isUp: boolean;
  };
}

export function ExpenseChart({ data, trend }: ExpenseChartProps) {
  const { theme } = useTheme();

  // Get first and last month for description
  const firstMonth = data[0]?.month;
  const lastMonth = data[data.length - 1]?.month;
  const currentYear = new Date().getFullYear();
  const dateRange = `${firstMonth} - ${lastMonth} ${currentYear}`;

  const chartConfig = {
    credit: {
      label: "Income",
      color:
        theme === "dark" ? "hsl(217, 91%, 60%)" : "hsl(142.1, 76.2%, 36.3%)",
    },
    debit: {
      label: "Expense",
      color: theme === "dark" ? "hsl(322, 75%, 46%)" : "hsl(25, 95%, 53%)",
    },
  } satisfies ChartConfig;

  const formatTooltipValue = (value: number, name: string) => {
    const label = name === "credit" ? "Income" : "Expense";
    return [`₹${value}`, label];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Monthly Analysis</CardTitle>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data} height={300}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              name="credit"
              dataKey="credit"
              fill={theme === "dark" ? "#3b82f6" : "#22c55e"}
              radius={4}
            />
            <Bar
              name="debit"
              dataKey="debit"
              fill={theme === "dark" ? "#d946ef" : "#f97316"}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend.isUp ? "Up" : "Down"} by {trend.percentage}% this month{" "}
          {trend.isUp ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Comparing income and expenses for the last 3 months
        </div>
      </CardFooter>
    </Card>
  );
}
