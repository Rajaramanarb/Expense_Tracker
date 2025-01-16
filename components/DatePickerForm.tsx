"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function DatePickerForm() {
  const [date, setDate] = useState<Date>();
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [open, setOpen] = useState(false);

  // Update hidden input when date changes
  useEffect(() => {
    if (date) {
      const formatted = format(date, "dd/MM/yyyy");
      setFormattedDate(formatted);
      const hiddenInput = document.getElementById("date") as HTMLInputElement;
      if (hiddenInput) {
        hiddenInput.value = formatted;
      }
    }
  }, [date]);

  return (
    <div className="col-span-3">
      <input
        type="hidden"
        name="date"
        id="date"
        value={formattedDate}
        required
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                setDate(newDate);
                setOpen(false);
              }
            }}
            initialFocus
            required
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
