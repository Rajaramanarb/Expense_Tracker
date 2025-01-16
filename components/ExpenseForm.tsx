"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DatePickerForm } from "./DatePickerForm";

export function ExpenseForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/add-entry", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add entry");
      }

      toast({
        title: "Success!",
        description: "Entry has been added successfully.",
      });

      // Refresh the page data
      router.refresh();

      // Close the dialog by clicking the close button
      const closeButton = document.querySelector('[aria-label="Close"]');
      if (closeButton instanceof HTMLButtonElement) {
        closeButton.click();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description:
          error instanceof Error ? error.message : "Failed to add entry",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Date
          </Label>
          <DatePickerForm />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="remarks" className="text-right">
            Remarks
          </Label>
          <Input id="remarks" className="col-span-3" name="remarks" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="debit" className="text-right">
            Debit
          </Label>
          <Input id="debit" type="number" className="col-span-3" name="debit" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="credit" className="text-right">
            Credit
          </Label>
          <Input
            id="credit"
            type="number"
            className="col-span-3"
            name="credit"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Entry"}
        </Button>
      </DialogFooter>
    </form>
  );
}
