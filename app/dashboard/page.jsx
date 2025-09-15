import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DeleteExpenseButton from "@/components/DeleteExpenseButton";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;

  // Fetch expenses with category information
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select(
      `
      id,
      amount,
      description,
      date,
      categories (
        name,
        color
      )
    `
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (expensesError) {
    console.error("Error fetching expenses:", expensesError);
  }

  // Calculate total expenses
  const totalExpenses =
    expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) ||
    0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">Hello {user.email}</p>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalExpenses)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {expenses?.length || 0} expense{expenses?.length !== 1 ? "s" : ""}{" "}
            recorded
          </p>
        </div>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your expense history</CardDescription>
        </CardHeader>
        <CardContent>
          {!expenses || expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No expenses recorded yet
              </p>
              <Button asChild>
                <a href="/add-expense">Add Your First Expense</a>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: expense.categories?.color + "20",
                          color: expense.categories?.color,
                          border: `1px solid ${expense.categories?.color}40`,
                        }}
                      >
                        {expense.categories?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteExpenseButton expenseId={expense.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
