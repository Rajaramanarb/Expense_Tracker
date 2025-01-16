import { getAllTransactions, getTotals } from "@/lib/google-sheets";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ExpenseChart } from "../ExpenseChart";

const RightSidebar = async () => {
  const totals = await getTotals();
  const transactions = await getAllTransactions();

  // Process data for the last 3 months
  const today = new Date();
  const last3Months = Array.from({ length: 3 }, (_, i) => {
    const date = subMonths(today, i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthTransactions = transactions.filter((row) => {
      const [day, month, year] = row[0].split("/");
      const txDate = new Date(Number(year), Number(month) - 1, Number(day));
      return txDate >= monthStart && txDate <= monthEnd;
    });

    const monthlyTotals = monthTransactions.reduce(
      (acc, row) => {
        acc.credit += Number(row[3]) || 0;
        acc.debit += Number(row[2]) || 0;
        return acc;
      },
      { credit: 0, debit: 0 }
    );

    return {
      month: format(date, "MMMM"),
      ...monthlyTotals,
    };
  }).reverse();

  // Calculate trend
  const currentMonth = last3Months[2];
  const previousMonth = last3Months[1];
  const trend = {
    percentage: Math.abs(
      ((currentMonth.credit -
        currentMonth.debit -
        (previousMonth.credit - previousMonth.debit)) /
        (previousMonth.credit - previousMonth.debit)) *
        100
    ).toFixed(1),
    isUp:
      currentMonth.credit - currentMonth.debit >
      previousMonth.credit - previousMonth.debit,
  };

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_ligth900">Account Summary</h3>
        <div className="mt-7 flex flex-col gap-4">
          {totals.map((row, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 bg-light-800 dark:bg-dark-300 rounded-lg"
            >
              <span className="text-dark500_light700 font-medium">
                {row[0]}
              </span>
              <span
                className={`font-bold ${
                  index === 2 ? "text-green-500" : "text-dark500_light700"
                }`}
              >
                ₹{row[1]}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <ExpenseChart data={last3Months} trend={trend} />
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
