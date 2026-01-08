import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AdminRoomsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-32 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>
            </div>

            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="flex flex-col min-h-[200px]">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-baseline gap-2">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-4 w-10" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 flex-1 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between py-1">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <div className="flex justify-between py-1">
                                    <Skeleton className="h-4 w-10" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </CardContent>
                        <div className="border-t p-3">
                            <Skeleton className="h-4 w-24 mx-auto" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
