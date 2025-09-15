"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const handleFilterChange = (newFilter) => {
    const params = new URLSearchParams(searchParams);

    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <span className="text-sm font-medium text-muted-foreground">
        Filter by:
      </span>

      {/* Mobile/Tablet Select Dropdown */}
      <div className="sm:hidden w-full">
        <Select value={currentFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select time period" />
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
      <div className="hidden sm:flex gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={currentFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(option.value)}
            className="text-xs"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
