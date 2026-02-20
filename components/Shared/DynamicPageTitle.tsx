'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Route path to display title mapping
const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/settings': 'Einstellungen',
  '/dashboard/settings-profile': 'Profil & Einstellungen',
  '/dashboard/settings-profile/fragen': 'Fragen',
  '/dashboard/settings-profile/benachrichtigungen': 'Benachrichtigungen',
  '/dashboard/settings-profile/notifications': 'Benachrichtigungen',
  '/dashboard/settings-profile/sprache': 'Sprache',
  '/dashboard/settings-profile/language': 'Sprache',
  '/dashboard/settings-profile/backup': 'Backup',
  '/dashboard/settings-profile/communication': 'Kommunikation',
  '/dashboard/settings-profile/changes-password': 'Passwort ändern',
  '/dashboard/settings-profile/design': 'Design',
  '/dashboard/settings-profile/einlagen': 'Einlagen',
  '/dashboard/settings-profile/lager': 'Lager',
  '/dashboard/settings-profile/preisverwaltung': 'Preisverwaltung',
  '/dashboard/settings-profile/arbeitszettel': 'Arbeitszettel',
  '/dashboard/settings-profile/automatische': 'Automatische Einstellungen',
  '/dashboard/settings-profile/automatische-orders': 'Automatische Bestellungen',
  '/dashboard/settings-profile/software-scanstation': 'Software Scanstation',
  '/dashboard/settings-profile/scan': 'Scan',
  '/dashboard/settings-profile/_werkstattzettel': 'Werkstattzettel',
  '/dashboard/news': 'News & Aktuelles',
  '/dashboard/products': 'Produktkatalog',
  '/dashboard/customers': 'Kundensuche',
  '/dashboard/neukundenerstellung': 'Neukundenerstellung',
  '/dashboard/orders': 'Einlagenaufträge',
  '/dashboard/massschuhauftraege': 'Maßschuhaufträge',
  '/dashboard/custom-shafts': 'Maßschäfte',
  '/dashboard/lager': 'Produktverwaltung',
  '/dashboard/email': 'Nachrichten',
  '/dashboard/automatisierte-nachrichten': 'Automatisierte Nachrichten',
  '/dashboard/calendar': 'Terminkalender',
  '/dashboard/kasse': 'Kasse & Abholungen',
  '/dashboard/finanzen-kasse': 'Finanzen & Kasse',
  '/dashboard/monatsstatistik': 'Monatsstatistik',
  '/dashboard/mitarbeitercontrolling': 'Mitarbeitercontrolling',
  '/dashboard/einlagencontrolling': 'Einlagencontrolling',
  '/dashboard/foot-exercises': 'Fußübungen',
  '/dashboard/balance-dashboard': 'Transaktionen & Balance',
  '/dashboard/statistiken': 'Statistiken',
  '/dashboard/employee-profile': 'Mitarbeiterprofil',
  '/dashboard/users': 'Benutzerverwaltung',
  '/dashboard/support': 'Support',
  '/dashboard/software': 'Software',
  '/dashboard/overview': 'Übersicht',
  '/dashboard/buy-storage': 'Speicher kaufen',
  '/dashboard/bodenkonstruktion': 'Bodenkonstruktion',
  '/dashboard/leistenkonfigurator': 'Leistenkonfigurator',
  '/dashboard/einnahmen': 'Einnahmen',
  '/dashboard/account-settings': 'Kontoeinstellungen',
  // '/dashboard/kasse': 'Kasse',
  '/dashboard/finance': 'Finanzen',
  '/dashboard/versorgungs': 'Versorgungen',
  '/dashboard/musterzettel': 'Musterzettel',
  '/dashboard/group-orders': 'Sammelbestellungen',
  '/dashboard/last-scans': 'Letzte Scans',
};

// Fallback: convert path segment to readable title (e.g. "settings-profile" -> "Settings Profile")
function pathToTitle(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTitleFromPath(pathname: string): string {
  // Exact match
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];

  // Try matching parent paths (for nested or dynamic routes)
  const segments = pathname.split('/').filter(Boolean);
  for (let i = segments.length; i >= 1; i--) {
    const parentPath = '/' + segments.slice(0, i).join('/');
    if (ROUTE_TITLES[parentPath]) {
      // For dynamic routes like /dashboard/orders/123, show "Einlagenaufträge" or add detail
      return ROUTE_TITLES[parentPath];
    }
  }

  // Fallback: use last meaningful segment
  const lastSegment = segments[segments.length - 1];
  if (lastSegment && !/^\d+$/.test(lastSegment) && !/^[a-f0-9-]{36}$/i.test(lastSegment)) {
    return pathToTitle(lastSegment);
  }
  const secondLast = segments[segments.length - 2];
  return secondLast ? pathToTitle(secondLast) : 'Dashboard';
}

export default function DynamicPageTitle() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const title = getTitleFromPath(pathname);
    document.title = title;
  }, [pathname]);

  return null;
}
