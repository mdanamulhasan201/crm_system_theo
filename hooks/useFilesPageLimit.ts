'use client';

import { useEffect, useState } from 'react';

/** Approximate file card row height in the responsive grid (px). */
const ROW_HEIGHT = 175;
const RESERVED_UI = 300;

function computeLimit(): number {
  if (typeof window === 'undefined') return 16;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const cols = vw >= 1536 ? 5 : vw >= 1024 ? 3 : vw >= 640 ? 2 : 1;
  const rows = Math.max(2, Math.ceil((vh - RESERVED_UI) / ROW_HEIGHT));
  return Math.min(50, Math.max(8, rows * cols));
}

/**
 * Page size for file pagination: scales with viewport (grid columns × visible rows).
 */
export function useFilesPageLimit() {
  const [limit, setLimit] = useState(() => computeLimit());

  useEffect(() => {
    let timeoutId: number;
    const onResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setLimit(computeLimit()), 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return limit;
}
