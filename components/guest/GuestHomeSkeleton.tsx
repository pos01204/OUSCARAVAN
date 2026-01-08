import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function GuestHomeSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Hero Section Skeleton */}
            <div className="relative overflow-hidden rounded-lg bg-muted p-8 text-center h-[120px] flex items-center justify-center">
                <Skeleton className="h-8 w-3/4 bg-muted-foreground/20" />
            </div>

            {/* Status Cards Grid Skeleton */}
            <section className="grid gap-4 md:grid-cols-2">
                {/* Wifi Card Skeleton */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32 mb-1" />
                        <Skeleton className="h-3 w-40" />
                    </CardContent>
                </Card>

                {/* Time Card Skeleton */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
            </section>

            {/* Reservation Info Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
