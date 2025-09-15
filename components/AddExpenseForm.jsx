"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createExpense } from "@/app/add-expense/actions";

export default function AddExpenseForm({ categories }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createExpense(formData);

      if (result.success) {
        setSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.error || "Failed to create expense");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Expense Added Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Redirecting to your dashboard...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <CardTitle>Expense Details</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
              className="text-lg"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What did you spend money on?"
              required
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={today}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              id="category"
              name="category_id"
              required
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Expense...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              asChild
              disabled={isSubmitting}
            >
              <Link href="/dashboard">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
