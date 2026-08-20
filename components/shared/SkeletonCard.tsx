interface SkeletonCardProps {
  count?: number;
}

function SingleSkeletonCard() {
  return (
    <div className="pms-card p-5 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="pms-skeleton h-2.5 w-24 rounded" />
        <div className="pms-skeleton h-5 w-5 rounded" />
      </div>
      <div className="pms-skeleton h-9 w-16 rounded" />
      <div className="pms-skeleton h-2.5 w-32 rounded" />
    </div>
  );
}

export default function SkeletonCard({ count = 4 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeletonCard key={i} />
      ))}
    </>
  );
}
