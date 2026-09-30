'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number | null;
  totalCount: number | null;
  pageSize?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  isLoading?: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize = 50,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  itemLabel = 'records',
  isLoading = false,
}: PaginationControlsProps) {
  // If there are no records and only 1 page or empty, don't show controls or show compact indicator
  if (totalCount === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-border-subtle rounded-lg text-xs text-ink-muted">
        <span>No {itemLabel} found</span>
      </div>
    );
  }

  // Calculate range display (e.g. "Showing 1 to 50 of 124 bookings")
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem =
    totalCount !== null
      ? Math.min(currentPage * pageSize, totalCount)
      : currentPage * pageSize;

  const canPrev = hasPrevPage ?? currentPage > 1;
  const canNext = hasNextPage ?? (totalPages !== null ? currentPage < totalPages : true);

  // Generate page numbers window
  const getPageNumbers = (): (number | string)[] => {
    if (!totalPages || totalPages <= 1) return [1];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // Always include first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always include last page
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-white border border-border-subtle rounded-lg text-xs shadow-2xs">
      {/* Information text */}
      <div className="text-ink-muted flex items-center gap-1.5 font-medium">
        {totalCount !== null ? (
          <>
            Showing{' '}
            <span className="font-semibold text-ink">
              {startItem}–{endItem}
            </span>{' '}
            of <span className="font-semibold text-ink">{totalCount}</span> {itemLabel}
          </>
        ) : (
          <>
            Page <span className="font-semibold text-ink">{currentPage}</span> of{' '}
            <span className="font-semibold text-ink">{totalPages || '—'}</span> {itemLabel}
          </>
        )}
        {isLoading && (
          <span className="inline-block w-2.5 h-2.5 ml-2 border-2 border-brand-forest border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1 self-end sm:self-auto">
        {/* First page button */}
        {totalPages && totalPages > 5 && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={!canPrev || isLoading}
            className="p-1.5 rounded border border-border-subtle bg-white text-ink-muted hover:text-ink hover:bg-brand-sand disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="First Page"
            aria-label="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Previous page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev || isLoading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-border-subtle bg-white text-ink hover:bg-brand-sand disabled:opacity-40 disabled:pointer-events-none font-medium transition-colors cursor-pointer"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page pills */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((item, idx) => {
            if (typeof item === 'string') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-ink-muted select-none">
                  …
                </span>
              );
            }

            const isActive = item === currentPage;

            return (
              <button
                key={`page-${item}`}
                type="button"
                onClick={() => onPageChange(item)}
                disabled={isActive || isLoading}
                className={`min-w-[28px] h-7 px-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-brand-forest text-white shadow-2xs font-semibold'
                    : 'bg-white text-ink border border-border-subtle hover:bg-brand-sand'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext || isLoading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-border-subtle bg-white text-ink hover:bg-brand-sand disabled:opacity-40 disabled:pointer-events-none font-medium transition-colors cursor-pointer"
          title="Next Page"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last page button */}
        {totalPages && totalPages > 5 && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNext || isLoading}
            className="p-1.5 rounded border border-border-subtle bg-white text-ink-muted hover:text-ink hover:bg-brand-sand disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Last Page"
            aria-label="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
