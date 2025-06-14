"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const [isOpen, setIsOpen] = useState(false)

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
    <div className={className}>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Active</span>
            )}
          </div>
        </Button>
      </div>

      {/* Sort Dropdown - Always Visible */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Sort & Filter</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort by
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

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-2" />
          Clear all filters
        </Button>
      )}

      {/* Filter Content */}
      <div className={`space-y-4 ${isOpen || window.innerWidth >= 768 ? "block" : "hidden"} md:block`}>
        <Accordion type="multiple" defaultValue={["type", "price", "duration"]} className="w-full">
          {/* Offering Type Filter */}
          <AccordionItem value="type">
            <AccordionTrigger className="text-base font-medium">
              Offering Type
              {filters.offeringTypes.length > 0 && (
                <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {filters.offeringTypes.length}
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
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
            </AccordionContent>
          </AccordionItem>

          {/* Price Range Filter */}
          <AccordionItem value="price">
            <AccordionTrigger className="text-base font-medium">Price Range (₹)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>

                {/* Free/Paid Toggle */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="free-only"
                      checked={filters.isFree === true}
                      onCheckedChange={(checked) => handleFreeFilterChange(checked ? true : null)}
                    />
                    <Label htmlFor="free-only" className="text-sm font-normal cursor-pointer">
                      Free only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="paid-only"
                      checked={filters.isFree === false}
                      onCheckedChange={(checked) => handleFreeFilterChange(checked ? false : null)}
                    />
                    <Label htmlFor="paid-only" className="text-sm font-normal cursor-pointer">
                      Paid only
                    </Label>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Duration Filter */}
          <AccordionItem value="duration">
            <AccordionTrigger className="text-base font-medium">
              Duration
              {filters.duration.length > 0 && (
                <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {filters.duration.length}
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {DURATION_OPTIONS.map((duration) => (
                  <div key={duration.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`duration-${duration.value}`}
                      checked={filters.duration.includes(duration.value)}
                      onCheckedChange={(checked) => handleDurationChange(duration.value, checked as boolean)}
                    />
                    <Label htmlFor={`duration-${duration.value}`} className="text-sm font-normal cursor-pointer">
                      {duration.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
