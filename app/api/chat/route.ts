import { appendRow, getAllTransactions } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

interface TransactionData {
  date?: string;
  remarks?: string;
  debit?: string;
  credit?: string;
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const transactions = await getAllTransactions();

    // Check if message is about adding a transaction
    const addTransactionIntent =
      message.toLowerCase().includes("add") ||
      message.toLowerCase().includes("create") ||
      message.toLowerCase().includes("new transaction");

    if (addTransactionIntent) {
      // Parse potential transaction data from message
      const transactionData: TransactionData = {};

      // Try to extract date (dd/mm/yyyy format)
      const dateMatch = message.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
      if (dateMatch) {
        // Convert to dd/mm/yyyy format
        const [_, day, month, year] = dateMatch;
        transactionData.date = `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
      }

      // Try to extract amount with ₹ symbol
      const amountMatch = message.match(
        /(?:₹\s*(\d+)|credit:\s*(\d+)|debit:\s*(\d+)|(?:of|with)\s+(\d+))/i
      );
      if (amountMatch) {
        const amount =
          amountMatch[1] || amountMatch[2] || amountMatch[3] || amountMatch[4];
        if (
          message.toLowerCase().includes("credit") ||
          message.toLowerCase().includes("salary") ||
          message.toLowerCase().includes("income")
        ) {
          transactionData.credit = amount;
        } else if (message.toLowerCase().includes("debit")) {
          transactionData.debit = amount;
        } else {
          transactionData.debit = amount; // Default to debit if not specified
        }
      }

      // Try to extract remarks (anything after "for" or "remarks")
      const remarksMatch = message.match(
        /remarks:\s*([^,]+)|for\s+([^,₹]+)|(?:with|of)\s+(\w+)\s+of/i
      );
      if (remarksMatch) {
        transactionData.remarks = (
          remarksMatch[1] ||
          remarksMatch[2] ||
          remarksMatch[3] ||
          "salary"
        ).trim();
      }

      // Check for missing required fields
      const missingFields = [];
      if (!transactionData.date)
        missingFields.push("date (in dd/mm/yyyy format)");
      if (!transactionData.remarks) missingFields.push("remarks");
      if (!transactionData.debit && !transactionData.credit)
        missingFields.push("amount");

      if (missingFields.length > 0) {
        return NextResponse.json({
          message: `To add a transaction, I need the following information:\n${missingFields.join("\n")}\n\nPlease provide the missing details.`,
        });
      }

      // If all required fields are present, add the transaction
      try {
        const total =
          (Number(transactionData.credit) || 0) -
          (Number(transactionData.debit) || 0);
        await appendRow([
          transactionData.date,
          transactionData.remarks,
          transactionData.debit || "",
          transactionData.credit || "",
          total.toString(),
        ]);

        return NextResponse.json({
          message: `Transaction added successfully!\n\nDetails:\nDate: ${transactionData.date}\nRemarks: ${transactionData.remarks}\n${transactionData.debit ? `Debit: ₹${transactionData.debit}` : `Credit: ₹${transactionData.credit}`}`,
        });
      } catch (error) {
        return NextResponse.json({
          message:
            "Sorry, I couldn't add the transaction. Please try again or add it manually.",
        });
      }
    }

    // Regular chat response for non-transaction queries
    // Calculate account summary
    let totalCredit = 0;
    let totalDebit = 0;
    let highestExpense = 0;
    let highestExpenseDetails = "";

    // Create a list of recent transactions
    const recentTransactions = transactions
      .slice(0, 10) // Get last 10 transactions
      .map(
        (row) =>
          `${row[0]} - ${row[1]} - Debit: ₹${row[2] || 0} - Credit: ₹${row[3] || 0}`
      )
      .join("\n");

    transactions.forEach((row) => {
      const credit = Number(row[3]) || 0;
      const debit = Number(row[2]) || 0;
      totalCredit += credit;
      totalDebit += debit;

      if (debit > highestExpense) {
        highestExpense = debit;
        highestExpenseDetails = `${row[0]} - ${row[1]} - ₹${debit}`;
      }
    });

    const balance = totalCredit - totalDebit;

    // Create a context with financial data
    const context = `
Current account information:
- Total Balance: ₹${balance}
- Total Credits: ₹${totalCredit}
- Total Debits: ₹${totalDebit}
- Highest Expense: ${highestExpenseDetails}

Number of transactions: ${transactions.length}

Recent Transactions:
${recentTransactions}

Transaction History (Format: Date - Description - Debit - Credit):
${transactions.map((row) => `${row[0]} - ${row[1]} - ₹${row[2] || 0} - ₹${row[3] || 0}`).join("\n")}

Use this information to answer user queries about their finances. When mentioning amounts, always include the ₹ symbol.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Your helpful expense tracking assistant.",
            },
            {
              role: "system",
              content: context,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      message: data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
