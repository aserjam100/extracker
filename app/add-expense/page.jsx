import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AddExpenseForm from "@/components/AddExpenseForm";

export default async function AddExpensePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  // Fetch categories for the form
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, icon, color")
    .order("name");

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add Expense</h1>
        <p className="text-gray-600 mt-2">Record a new expense entry</p>
      </div>

      <AddExpenseForm categories={categories || []} />
    </div>
  );
}
