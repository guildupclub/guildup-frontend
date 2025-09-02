"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { ArrowUpDown, Filter, X } from "lucide-react"

export interface FilterState {
  offeringTypes: string[]
  priceRange: [number, number]
  sortBy: string
  duration: string[]
  isFree: boolean | null
}

interface OfferingFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  className?: string
}

const OFFERING_TYPES = [
  { value: "consultation", label: "Consultation" },
  { value: "webinar", label: "Webinar" },
  { value: "package", label: "Package" },
  { value: "class", label: "Class" },
]

const DURATION_OPTIONS = [
  { value: "0-30", label: "0-30 minutes" },
  { value: "30-60", label: "30-60 minutes" },
  { value: "60-120", label: "1-2 hours" },
  { value: "120+", label: "2+ hours" },
]

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "duration-short", label: "Duration: Short to Long" },
  { value: "duration-long", label: "Duration: Long to Short" },
  { value: "newest", label: "Newest First" },
]

export function OfferingFilters({ filters, onFiltersChange, onClearFilters, className }: OfferingFiltersProps) {

  const handleOfferingTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked ? [...filters.offeringTypes, type] : filters.offeringTypes.filter((t) => t !== type)

    onFiltersChange({ ...filters, offeringTypes: newTypes })
  }

  const handleDurationChange = (duration: string, checked: boolean) => {
    const newDurations = checked ? [...filters.duration, duration] : filters.duration.filter((d) => d !== duration)

    onFiltersChange({ ...filters, duration: newDurations })
  }

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const handleFreeFilterChange = (isFree: boolean | null) => {
    onFiltersChange({ ...filters, isFree })
  }

  const hasActiveFilters =
    filters.offeringTypes.length > 0 ||
    filters.duration.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000 ||
    filters.isFree !== null

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Left: Compact filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Offering Type */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Type
                {filters.offeringTypes.length > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {filters.offeringTypes.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-3 w-64" align="start">
              <div className="space-y-2">
                {OFFERING_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={filters.offeringTypes.includes(type.value)}
                      onCheckedChange={(checked) => handleOfferingTypeChange(type.value, checked as boolean)}
                    />
                    <Label htmlFor={`type-${type.value}`} className="text-sm font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Duration */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Duration
                {filters.duration.length > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {filters.duration.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-3 w-64" align="start">
              <div className="space-y-2">
                {DURATION_OPTIONS.map((d) => (
                  <div key={d.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`duration-${d.value}`}
                      checked={filters.duration.includes(d.value)}
                      onCheckedChange={(checked) => handleDurationChange(d.value, checked as boolean)}
                    />
                    <Label htmlFor={`duration-${d.value}`} className="text-sm font-normal cursor-pointer">
                      {d.label}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Price */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Price
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 || filters.isFree !== null) && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">•</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 w-72" align="start">
              <div className="space-y-3">
                <Slider value={filters.priceRange} onValueChange={handlePriceRangeChange} max={10000} min={0} step={100} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="free-only" checked={filters.isFree === true} onCheckedChange={(c) => handleFreeFilterChange(c ? true : null)} />
                    <Label htmlFor="free-only" className="text-sm">Free only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="paid-only" checked={filters.isFree === false} onCheckedChange={(c) => handleFreeFilterChange(c ? false : null)} />
                    <Label htmlFor="paid-only" className="text-sm">Paid only</Label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Right: Sort */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" /> Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={filters.sortBy} onValueChange={handleSortChange}>
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
