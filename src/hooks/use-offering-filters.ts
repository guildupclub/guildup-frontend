"use client"

import { useState, useMemo } from "react"
import type { FilterState } from "@/components/filter/offering-filters"

interface Community {
  _id: string
  community: any
  offerings: any[]
}

export function useOfferingFilters(communities: Community[]) {
  const [filters, setFilters] = useState<FilterState>({
    offeringTypes: [],
    priceRange: [0, 10000],
    sortBy: "featured",
    duration: [],
    isFree: null,
  })

  const clearFilters = () => {
    setFilters({
      offeringTypes: [],
      priceRange: [0, 10000],
      sortBy: "featured",
      duration: [],
      isFree: null,
    })
  }

  const filteredAndSortedCommunities = useMemo(() => {
    let filtered = communities.map((community) => {
      // Filter offerings based on criteria
      let filteredOfferings = community.offerings.filter((offering) => {
        // Type filter
        if (filters.offeringTypes.length > 0 && !filters.offeringTypes.includes(offering.type)) {
          return false
        }

        // Price filter
        const price = offering.discounted_price || offering.price?.amount || 0
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
          return false
        }

        // Free/Paid filter
        if (filters.isFree !== null) {
          const isFree = offering.is_free || price === 0
          if (filters.isFree !== isFree) {
            return false
          }
        }

        // Duration filter
        if (filters.duration.length > 0) {
          const duration = offering.duration || 0
          const matchesDuration = filters.duration.some((range) => {
            switch (range) {
              case "0-30":
                return duration <= 30
              case "30-60":
                return duration > 30 && duration <= 60
              case "60-120":
                return duration > 60 && duration <= 120
              case "120+":
                return duration > 120
              default:
                return false
            }
          })
          if (!matchesDuration) {
            return false
          }
        }

        return true
      })

      // Sort offerings
      filteredOfferings = filteredOfferings.sort((a, b) => {
        const priceA = a.discounted_price || a.price?.amount || 0
        const priceB = b.discounted_price || b.price?.amount || 0
        const durationA = a.duration || 0
        const durationB = b.duration || 0

        switch (filters.sortBy) {
          case "price-low":
            return priceA - priceB
          case "price-high":
            return priceB - priceA
          case "duration-short":
            return durationA - durationB
          case "duration-long":
            return durationB - durationA
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case "featured":
          default:
            return 0
        }
      })

      return {
        ...community,
        offerings: filteredOfferings,
      }
    })

    // Filter out communities with no offerings if filters are applied
    const hasActiveFilters =
      filters.offeringTypes.length > 0 ||
      filters.duration.length > 0 ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 10000 ||
      filters.isFree !== null

    if (hasActiveFilters) {
      filtered = filtered.filter((community) => community.offerings.length > 0)
    }

    // Sort communities by their best offering or community metrics
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          const minPriceA = Math.min(...a.offerings.map((o) => o.discounted_price || o.price?.amount || 0))
          const minPriceB = Math.min(...b.offerings.map((o) => o.discounted_price || o.price?.amount || 0))
          return minPriceA - minPriceB
        case "price-high":
          const maxPriceA = Math.max(...a.offerings.map((o) => o.discounted_price || o.price?.amount || 0))
          const maxPriceB = Math.max(...b.offerings.map((o) => o.discounted_price || b.price?.amount || 0))
          return maxPriceB - maxPriceA
        case "featured":
        default:
          return (b.community?.score || 0) - (a.community?.score || 0)
      }
    })
  }, [communities, filters])

  return {
    filters,
    setFilters,
    clearFilters,
    filteredAndSortedCommunities,
  }
}
