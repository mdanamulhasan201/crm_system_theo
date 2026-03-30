'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_BOX_CLASS =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#679C7A]/15 text-[#679C7A]';

export default function SectionCardHeader({
  icon: Icon,
  title,
  subtitle,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  /** z. B. `mb-0` wenn die Zeile mit Toggle in einer gemeinsamen `mb-5`-Zeile sitzt */
  className?: string;
}) {
  return (
    <div className={cn(' flex gap-3', className)}>
      {Icon ? (
        <div className={ICON_BOX_CLASS} aria-hidden>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      ) : null}
      <div className="min-w-0">
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
