import { format } from "date-fns";
import { JWT } from "google-auth-library";
import { google } from "googleapis";

if (
  !process.env.GOOGLE_CLIENT_EMAIL ||
  !process.env.GOOGLE_PRIVATE_KEY ||
  !process.env.GOOGLE_SHEET_ID
) {
  throw new Error(
    "Missing required Google API credentials in environment variables"
  );
}

// Initialize auth - you'll need to set these env variables
const client = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth: client });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = "Sheet1!A4:E"; // Changed from 'Sheet1!A2:E' to include header row

export async function getSheetData() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    return response.data.values || [];
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return [];
  }
}

export async function appendRow(newRow: string[]) {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRow],
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error appending row:", error);
    throw error;
  }
}

export async function getTotals() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!F1:G3",
    });

    return response.data.values || [];
  } catch (error) {
    console.error("Error fetching totals:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return [];
  }
}

export async function getMonths() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A4:A", // Get all dates
    });

    const dates = response.data.values || [];
    const months = new Set();

    dates.forEach((row) => {
      if (row[0]) {
        const [_, month, year] = row[0].split("/");
        months.add(`${month}/${year}`);
      }
    });

    return Array.from(months) as string[]; // Type assertion to string[]
  } catch (error) {
    console.error("Error fetching months:", error);
    return [];
  }
}

export async function getSheetDataByMonth(month: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A4:E",
    });

    const allData = response.data.values || [];
    const [startMonth, startYear] = month.split("/");
    const startDate = new Date(`${startMonth}/01/${startYear}`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of the month

    // Filter data for date range
    return allData.filter((row) => {
      if (!row[0]) return false;
      const [day, month, year] = row[0].split("/");
      const rowDate = new Date(`${month}/${day}/${year}`);
      return rowDate >= startDate && rowDate <= endDate;
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}

export async function getSheetDataByDateRange(
  fromDate?: string,
  toDate?: string
) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A4:E",
    });

    const allData = response.data.values || [];

    if (!fromDate || !toDate) {
      // If no date range is provided, return current month data
      const today = new Date();
      const currentMonth = format(today, "MM/yyyy");
      return getSheetDataByMonth(currentMonth);
    }

    // Parse the date strings (dd/MM/yyyy format)
    const [fromDay, fromMonth, fromYear] = fromDate.split("/");
    const [toDay, toMonth, toYear] = toDate.split("/");

    const startDate = new Date(`${fromMonth}/${fromDay}/${fromYear}`);
    const endDate = new Date(`${toMonth}/${toDay}/${toYear}`);

    // Filter data for date range
    return allData.filter((row) => {
      if (!row[0]) return false;
      const [day, month, year] = row[0].split("/");
      const rowDate = new Date(`${month}/${day}/${year}`);
      return rowDate >= startDate && rowDate <= endDate;
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}

export async function getAllTransactions() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A4:E",
    });
    return response.data.values || [];
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return [];
  }
}
