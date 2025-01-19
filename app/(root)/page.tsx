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

const Home = async () => {
  const session = await auth();
  const months = await getMonths();

  // Get all transactions
  const allTransactions = await getAllTransactions();
  const currentMonth = months[0] || "";

  // Sort transactions by date in descending order
  const filteredData = allTransactions.sort((a, b) => {
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
