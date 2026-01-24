import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function GuestHomeSkeleton() {
    return (
        <div className="space-y-6">
            {/* Hero Section Skeleton — 브랜드 라이트 테마 */}
            <div className="relative overflow-hidden rounded-2xl bg-background-elevated p-8 text-center h-[120px] flex items-center justify-center border border-border">
                <Skeleton className="h-8 w-3/4" />
            </div>

            {/* Quick Actions Skeleton */}
            <section className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </section>

            {/* Status Cards Grid Skeleton */}
            <section className="grid gap-4 md:grid-cols-2">
                {/* Wifi Card Skeleton */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <div className="flex gap-2">
                            <Skeleton className="h-11 flex-1 rounded-xl" />
                            <Skeleton className="h-11 flex-1 rounded-xl" />
                        </div>
                    </CardContent>
                </Card>

                {/* Time Card Skeleton */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
