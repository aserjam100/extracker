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
import DateFilter from "@/components/DateFilter";
import ExpenseChart from "@/components/ExpenseChart";
import { CalendarDays, TrendingUp, Wallet, Target } from "lucide-react";

// Helper function to get date range based on filter
function getDateRange(filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { start: startOfWeek.toISOString().split("T")[0] };
    }
    case "month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth.toISOString().split("T")[0] };
    }
    case "3months": {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      return { start: threeMonthsAgo.toISOString().split("T")[0] };
    }
    case "all":
    default:
      return null;
  }
}

// Helper function to calculate statistics
function calculateStats(expenses, dateFilter) {
  if (!expenses || expenses.length === 0) {
    return {
      totalSpent: 0,
      avgDaily: 0,
      avgMonthly: 0,
      monthlyData: [],
      categoryData: [],
      highestExpense: 0,
    };
  }

  const now = new Date();
  const totalSpent = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  // Calculate daily average
  let daysSinceStart = 1;
  if (expenses.length > 0) {
    const oldestExpense = new Date(expenses[expenses.length - 1].date);
    const daysDiff = Math.ceil((now - oldestExpense) / (1000 * 60 * 60 * 24));
    daysSinceStart = Math.max(daysDiff, 1);
  }
  const avgDaily = totalSpent / daysSinceStart;

  // Calculate monthly data for chart
  const monthlyExpenses = {};
  const categoryExpenses = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    // Monthly totals
    monthlyExpenses[monthYear] =
      (monthlyExpenses[monthYear] || 0) + parseFloat(expense.amount);

    // Category totals
    const categoryName = expense.categories?.name || "Uncategorized";
    categoryExpenses[categoryName] =
      (categoryExpenses[categoryName] || 0) + parseFloat(expense.amount);
  });

  // Convert to chart data format
  const monthlyData = Object.entries(monthlyExpenses)
    .map(([month, amount]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      amount: amount,
    }))
    .sort((a, b) => new Date(a.month + " 1") - new Date(b.month + " 1"));

  const categoryData = Object.entries(categoryExpenses)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / totalSpent) * 100).toFixed(1),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate average monthly (last 3 months or all time)
  const recentMonths = monthlyData.slice(-3);
  const avgMonthly =
    recentMonths.length > 0
      ? recentMonths.reduce((sum, month) => sum + month.amount, 0) /
        recentMonths.length
      : totalSpent;

  const highestExpense = Math.max(...expenses.map((e) => parseFloat(e.amount)));

  return {
    totalSpent,
    avgDaily,
    avgMonthly,
    monthlyData,
    categoryData,
    highestExpense,
  };
}

export default async function Dashboard({ searchParams }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;
  const dateFilter = (await searchParams)?.filter || "all";
  const dateRange = getDateRange(dateFilter);

  // Build the query with optional date filtering
  let query = supabase
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
    .eq("user_id", user.id);

  // Apply date filter if specified
  if (dateRange?.start) {
    query = query.gte("date", dateRange.start);
  }

  // Execute query
  const { data: expenses, error: expensesError } = await query.order("date", {
    ascending: false,
  });

  if (expensesError) {
    console.error("Error fetching expenses:", expensesError);
  }

  // Get all expenses for comparison stats
  const { data: allExpenses } = await supabase
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

  // Calculate statistics
  const stats = calculateStats(expenses, dateFilter);
  const allTimeStats = calculateStats(allExpenses, "all");

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SGD",
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

  // Get filter display text
  const getFilterDisplayText = () => {
    switch (dateFilter) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "3months":
        return "Last 3 Months";
      case "all":
      default:
        return "All Time";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Hello {user.email}</p>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilter currentFilter={dateFilter} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Spent
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  {getFilterDisplayText()}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Daily Average
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  {getFilterDisplayText()}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.avgDaily)}
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Average
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  {dateFilter === "all" ? "Recent Months" : "Current Period"}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.avgMonthly)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Highest Expense
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  {getFilterDisplayText()}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.highestExpense)}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {stats.monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
              <CardDescription>
                Your spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseChart
                data={stats.monthlyData}
                type="line"
                dataKey="amount"
                xAxisKey="month"
              />
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>
                {getFilterDisplayText()} breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categoryData.slice(0, 6).map((category, index) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                        }}
                      />
                      <span className="text-sm font-medium">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(category.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats Row */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-lg font-semibold">
                {expenses?.length || 0} expense
                {expenses?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categories Used</p>
              <p className="text-lg font-semibold">
                {stats.categoryData.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">All Time Total</p>
              <p className="text-lg font-semibold">
                {formatCurrency(allTimeStats.totalSpent)}
              </p>
            </div>
            {dateFilter !== "all" && (
              <div>
                <p className="text-sm text-muted-foreground">
                  All Time Expenses
                </p>
                <p className="text-lg font-semibold">
                  {allExpenses?.length || 0}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {dateFilter === "all"
              ? "All Expenses"
              : `${getFilterDisplayText()} Expenses`}
          </CardTitle>
          <CardDescription>
            {dateFilter === "all"
              ? "Your complete expense history"
              : `Expenses from ${getFilterDisplayText().toLowerCase()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!expenses || expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {dateFilter === "all"
                  ? "No expenses recorded yet"
                  : `No expenses found for ${getFilterDisplayText().toLowerCase()}`}
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
