interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export default function SkeletonTable({ rows = 6, cols = 6 }: SkeletonTableProps) {
  return (
    <div className="pms-card overflow-hidden">
      {/* Table header skeleton */}
      <div className="pms-table-header px-4 py-3 flex items-center gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="pms-skeleton h-2 rounded" style={{ width: `${60 + (i % 3) * 20}px` }} />
        ))}
      </div>

      {/* Row skeletons */}
      <div className="divide-y divide-border-subtle/60">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="px-4 py-4 flex items-center gap-6">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="pms-skeleton h-3 rounded"
                style={{
                  width: colIdx === 0
                    ? '140px'
                    : colIdx === cols - 1
                    ? '60px'
                    : `${70 + (colIdx % 3) * 25}px`,
                  opacity: colIdx === 0 ? 1 : 0.7 - colIdx * 0.05,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
