import { Skeleton } from "@/components/ui/skeleton";

export default function RouteLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
