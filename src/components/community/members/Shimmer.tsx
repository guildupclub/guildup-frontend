import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function MembersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-[180px]" /> {/* For the "Community Members" title */}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              {/* Avatar skeleton */}
              <Skeleton className="h-10 w-10 rounded-full" />
              
              <div className="flex-1 space-y-2">
                {/* Name and badges skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-5 w-16" /> {/* Badge skeleton */}
                </div>
                {/* Join date skeleton */}
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
