import { Skeleton } from "@ui/components/skeleton";

export default function PostDetailLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-8 w-[300px]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-6 space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
