"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExpense(formData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "User not authenticated" };
  }

  // Extract form data
  const amount = formData.get("amount");
  const description = formData.get("description");
  const date = formData.get("date");
  const categoryId = formData.get("category_id");

  // Validate required fields
  if (!amount || !description || !date || !categoryId) {
    return { success: false, error: "All fields are required" };
  }

  // Validate amount
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { success: false, error: "Amount must be a positive number" };
  }

  try {
    // Insert the expense
    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          user_id: user.id,
          amount: numAmount,
          description: description.trim(),
          date,
          category_id: categoryId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return { success: false, error: "Failed to save expense" };
    }

    // Revalidate the dashboard page to show the new expense
    revalidatePath("/dashboard");

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteExpense(expenseId) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "User not authenticated" };
  }

  // Validate expense ID
  if (!expenseId) {
    return { success: false, error: "Expense ID is required" };
  }

  try {
    // First, verify the expense belongs to the current user
    const { data: expense, error: fetchError } = await supabase
      .from("expenses")
      .select("id, user_id")
      .eq("id", expenseId)
      .single();

    if (fetchError) {
      console.error("Error fetching expense:", fetchError);
      return { success: false, error: "Expense not found" };
    }

    if (expense.user_id !== user.id) {
      return { success: false, error: "Unauthorized to delete this expense" };
    }

    // Delete the expense
    const { error: deleteError } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", user.id); // Extra security check

    if (deleteError) {
      console.error("Database error:", deleteError);
      return { success: false, error: "Failed to delete expense" };
    }

    // Revalidate the dashboard page to reflect the deletion
    revalidatePath("/dashboard");

    return { success: true, message: "Expense deleted successfully" };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
