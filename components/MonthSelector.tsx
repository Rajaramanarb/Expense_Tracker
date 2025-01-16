"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, endOfMonth, format, startOfMonth } from "date-fns";
import { CalendarIcon, ListFilter, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface MonthSelectorProps {
  months: string[];
  currentMonth: string;
}

export default function MonthSelector({
  months,
  currentMonth,
}: MonthSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: currentMonth ? new Date(`01/${currentMonth}`) : new Date(),
    to: currentMonth ? new Date(`01/${currentMonth}`) : addDays(new Date(), 7),
  });

  const handleReset = () => {
    const today = new Date();
    const firstDay = startOfMonth(today);
    const lastDay = endOfMonth(today);

    setDate({
      from: firstDay,
      to: lastDay,
    });

    const fromDate = format(firstDay, "dd/MM/yyyy");
    const toDate = format(lastDay, "dd/MM/yyyy");

    const url = new URL(window.location.href);
    url.searchParams.set("from", fromDate);
    url.searchParams.set("to", toDate);
    router.push(url.pathname + "?" + url.searchParams.toString());
  };

  const handleViewAll = () => {
    setDate(undefined);
    router.push("/");
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>All Transactions</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              if (newDate?.from && newDate?.to) {
                const fromDate = format(newDate.from, "dd/MM/yyyy");
                const toDate = format(newDate.to, "dd/MM/yyyy");
                const url = new URL(window.location.href);
                url.searchParams.set("from", fromDate);
                url.searchParams.set("to", toDate);
                router.push(url.pathname + "?" + url.searchParams.toString());
                setOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleReset}
        title="Reset to current month"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleViewAll}
        title="View all transactions"
      >
        <ListFilter className="h-4 w-4" />
      </Button>
    </div>
  );
}
