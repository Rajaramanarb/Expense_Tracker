import { auth } from "@/auth";
import { ExpenseForm } from "@/components/ExpenseForm";
import MonthSelector from "@/components/MonthSelector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { getAllTransactions, getMonths } from "@/lib/google-sheets";

interface SearchParams {
  query?: string;
  from?: string;
  to?: string;
}

interface HomeProps {
  searchParams: SearchParams;
}

const Home = async ({ searchParams }: HomeProps) => {
  const session = await auth();
  const months = await getMonths();

  // Get all transactions first
  const allTransactions = await getAllTransactions();

  // Get search query
  const query =
    typeof searchParams.query === "string"
      ? searchParams.query.toLowerCase()
      : "";

  // Handle the date range parameters
  const fromDate =
    typeof searchParams.from === "string" ? searchParams.from : undefined;
  const toDate =
    typeof searchParams.to === "string" ? searchParams.to : undefined;

  const currentMonth = fromDate
    ? fromDate.split("/").slice(1).join("/")
    : months[0] || "";

  // First filter by search query
  const searchFiltered = query
    ? allTransactions.filter(
        (row) =>
          row[1].toLowerCase().includes(query) || // Search in remarks
          row[0].includes(query) || // Search in date
          row[2].includes(query) || // Search in debit
          row[3].includes(query) // Search in credit
      )
    : allTransactions;

  // Then filter by date range
  const filteredData =
    fromDate && toDate
      ? searchFiltered.filter((row) => {
          if (!row[0]) return false;
          const [day, month, year] = row[0].split("/");
          const rowDate = new Date(`${month}/${day}/${year}`);
          const [fromDay, fromMonth, fromYear] = fromDate.split("/");
          const [toDay, toMonth, toYear] = toDate.split("/");
          const startDate = new Date(`${fromMonth}/${fromDay}/${fromYear}`);
          const endDate = new Date(`${toMonth}/${toDay}/${toYear}`);
          return rowDate >= startDate && rowDate <= endDate;
        })
      : searchFiltered.sort((a, b) => {
          // Sort by date in descending order (newest first)
          const [dayA, monthA, yearA] = a[0].split("/");
          const [dayB, monthB, yearB] = b[0].split("/");
          const dateA = new Date(`${monthA}/${dayA}/${yearA}`);
          const dateB = new Date(`${monthB}/${dayB}/${yearB}`);
          return dateB.getTime() - dateA.getTime();
        });

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MonthSelector months={months} currentMonth={currentMonth} />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Entry</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Entry</DialogTitle>
              <DialogDescription>
                Enter the details for the new transaction.
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>Transaction History</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Transaction Remarks</TableHead>
            <TableHead>Debit</TableHead>
            <TableHead>Credit</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((row: string[], index: number) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{row[0]}</TableCell>
              <TableCell>{row[1]}</TableCell>
              <TableCell>{row[2]}</TableCell>
              <TableCell>{row[3]}</TableCell>
              <TableCell className="text-right">{row[4]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Toaster />
    </div>
  );
};

export default Home;
