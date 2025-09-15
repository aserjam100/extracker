"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const filterOptions = [
  { value: "all", label: "All Time" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "3months", label: "Last 3 Months" },
];

export default function DateFilter({ currentFilter = "all" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState(currentFilter);

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);

    startTransition(() => {
      const params = new URLSearchParams(searchParams);

      if (newFilter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", newFilter);
      }

      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <span className="text-sm font-medium text-muted-foreground">
        Filter by:
      </span>

      {/* Mobile/Tablet Select Dropdown */}
      <div className="sm:hidden w-full">
        <Select
          value={activeFilter}
          onValueChange={handleFilterChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <SelectValue placeholder="Select time period" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Button Group */}
      <div className="hidden sm:flex gap-2 items-center">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={activeFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(option.value)}
            disabled={isPending}
            className="text-xs transition-all duration-200"
          >
            {isPending && activeFilter === option.value && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {option.label}
          </Button>
        ))}

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating...</span>
          </div>
        )}
      </div>
    </div>
  );
}
