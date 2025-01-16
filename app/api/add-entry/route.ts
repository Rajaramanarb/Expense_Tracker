import { appendRow } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const date = formData.get("date") as string;

    // Validate date format
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use dd/mm/yyyy" },
        { status: 400 }
      );
    }

    const remarks = formData.get("remarks") as string;
    const debit = formData.get("debit") as string;
    const credit = formData.get("credit") as string;

    // Calculate total
    const total = (Number(credit) || 0) - (Number(debit) || 0);

    // Add row to Google Sheet
    await appendRow([date, remarks, debit, credit, total.toString()]);

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error adding entry:", error);
    return NextResponse.json({ error: "Failed to add entry" }, { status: 500 });
  }
}
