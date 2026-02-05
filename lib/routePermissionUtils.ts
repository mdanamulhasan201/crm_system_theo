import type { IconType } from 'react-icons';
import type { StaticImageData } from 'next/image';
import { RxDashboard } from "react-icons/rx";
import { IoSearchOutline } from 'react-icons/io5';
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { FiUserPlus, FiBarChart, FiDollarSign } from 'react-icons/fi';
import { BsCashStack } from 'react-icons/bs';
import { HiOutlineDocumentText, HiOutlineCube } from 'react-icons/hi';
import { BiNews, BiPackage } from 'react-icons/bi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { TbActivityHeartbeat, TbUsers } from 'react-icons/tb';
import Einlagenauftrag from '@/public/images/dashboard/partner_sidebar/Einlagenaufträge.png';
import Einstellungen from '@/public/images/dashboard/partner_sidebar/Einstellungen.png';
import Fußübungen from '@/public/images/dashboard/partner_sidebar/Fußübungen.png';
import Maßschäfte from '@/public/images/dashboard/partner_sidebar/Maßschäfte.png';
import Maßschuhaufträge from '@/public/images/dashboard/partner_sidebar/Maßschuhaufträge.png';
import Nachrichten from '@/public/images/dashboard/partner_sidebar/Nachrichten.png';
import Terminkalender from '@/public/images/dashboard/partner_sidebar/Terminkalender.png';

// Map path to icon
export const getIconForPath = (path: string): IconType | StaticImageData => {
  const pathMap: Record<string, IconType | StaticImageData> = {
    '/dashboard': RxDashboard,
    '/dashboard/teamchat': HiOutlineChatBubbleLeftRight,
    '/dashboard/customers': IoSearchOutline,
    '/dashboard/neukundenerstellung': FiUserPlus,
    '/dashboard/orders': Einlagenauftrag,
    '/dashboard/massschuhauftraege': Maßschuhaufträge,
    '/dashboard/custom-shafts': Maßschäfte,
    '/dashboard/lager': HiOutlineCube,
    '/dashboard/group-orders': HiOutlineCube,
    '/dashboard/email/inbox': Nachrichten,
    '/dashboard/calendar': Terminkalender,
    '/dashboard/monatsstatistik': FiBarChart,
    '/dashboard/mitarbeitercontrolling': TbUsers,
    '/dashboard/einlagencontrolling': TbActivityHeartbeat,
    '/dashboard/foot-exercises': Fußübungen,
    '/dashboard/musterzettel': Fußübungen,
    '/dashboard/settings': Einstellungen,
    '/dashboard/news': BiNews,
    '/dashboard/products': BiPackage,
    '/dashboard/balance-dashboard': MdAccountBalanceWallet,
    '/dashboard/automatisierte-nachrichten': HiOutlineChatBubbleLeftRight,
    '/dashboard/kasse': FiDollarSign,
    '/dashboard/finanzen-kasse': BsCashStack,
    '/dashboard/einnahmen': HiOutlineDocumentText,
  };
  
  return pathMap[path] || RxDashboard;
};

// Convert title to permission key format (lowercase, spaces to underscores, special chars handled)
export const titleToPermissionKey = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/&/g, '_and_')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// Map specific titles to their permission keys (based on the example provided)
export const getPermissionKeyForTitle = (title: string): string => {
  const titleMap: Record<string, string> = {
    'Dashboard': 'dashboard',
    'Teamchat': 'teamchat',
    'Kundensuche': 'kundensuche',
    'Neukundenerstellung': 'neukundenerstellung',
    'Einlagenaufträge': 'einlagenauftrage',
    'Maßschuhaufträge': 'massschuhauftrage',
    'Maßschäfte': 'massschafte',
    'Produktverwaltung': 'produktverwaltung',
    'Sammelbestellungen': 'sammelbestellungen',
    'Nachrichten': 'nachrichten',
    'Terminkalender': 'terminkalender',
    'Monatsstatistik': 'monatsstatistik',
    'Mitarbeitercontrolling': 'mitarbeitercontrolling',
    'Einlagencontrolling': 'einlagencontrolling',
    'Fußübungen': 'fusubungen',
    'Musterzettel': 'musterzettel',
    'Einstellungen': 'einstellungen',
    'News & Aktuelles': 'news_and_aktuelles',
    'Produktkatalog': 'produktkatalog',
    'Balance': 'balance',
    'Einnahmen & Rechnungen': 'einnahmen_and_rechnungen',
    'Finanzen & Kasse': 'finanzen_and_kasse',
    'Kasse & Abholungen': 'kasse_and_abholungen',
    'Automatisierte Nachrichten': 'automatisierte_nachrichten',
    // Nested items for Einstellungen
    'Grundeinstellungen': 'grundeinstellungen',
    'Backup Einstellungen': 'backup_einstellungen',
    'Kundenkommunikation': 'kundenkommunikation',
    'Werkstattzettel': 'werkstattzettel',
    'Benachrichtigungen': 'benachrichtigungen',
    'Lagereinstellungen': 'lagereinstellungen',
    'Preisverwaltung': 'preisverwaltung',
    'Software Scanstation': 'software_scanstation',
    'Design & Logo': 'design_and_logo',
    'Passwort ändern': 'passwort_andern',
    'Sprache': 'sprache',
    'Fragen': 'fragen',
    'Automatische Orders': 'automatische_orders',
  };
  
  return titleMap[title] || titleToPermissionKey(title);
};

// Reverse mapping: permission key to title
export const getTitleForPermissionKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'teamchat': 'Teamchat',
    'kundensuche': 'Kundensuche',
    'neukundenerstellung': 'Neukundenerstellung',
    'einlagenauftrage': 'Einlagenaufträge',
    'massschuhauftrage': 'Maßschuhaufträge',
    'massschafte': 'Maßschäfte',
    'produktverwaltung': 'Produktverwaltung',
    'sammelbestellungen': 'Sammelbestellungen',
    'nachrichten': 'Nachrichten',
    'terminkalender': 'Terminkalender',
    'monatsstatistik': 'Monatsstatistik',
    'mitarbeitercontrolling': 'Mitarbeitercontrolling',
    'einlagencontrolling': 'Einlagencontrolling',
    'fusubungen': 'Fußübungen',
    'musterzettel': 'Musterzettel',
    'einstellungen': 'Einstellungen',
    'news_and_aktuelles': 'News & Aktuelles',
    'produktkatalog': 'Produktkatalog',
    'balance': 'Balance',
    'einnahmen_and_rechnungen': 'Einnahmen & Rechnungen',
    'finanzen_and_kasse': 'Finanzen & Kasse',
    'kasse_and_abholungen': 'Kasse & Abholungen',
    'automatisierte_nachrichten': 'Automatisierte Nachrichten',
  };
  
  return keyMap[key] || key;
};

// Get path for permission key
export const getPathForPermissionKey = (key: string): string => {
  const pathMap: Record<string, string> = {
    'dashboard': '/dashboard',
    'teamchat': '/dashboard/teamchat',
    'kundensuche': '/dashboard/customers',
    'neukundenerstellung': '/dashboard/neukundenerstellung',
    'einlagenauftrage': '/dashboard/orders',
    'massschuhauftrage': '/dashboard/massschuhauftraege',
    'massschafte': '/dashboard/custom-shafts',
    'produktverwaltung': '/dashboard/lager',
    'sammelbestellungen': '/dashboard/group-orders',
    'nachrichten': '/dashboard/email/inbox',
    'terminkalender': '/dashboard/calendar',
    'monatsstatistik': '/dashboard/monatsstatistik',
    'mitarbeitercontrolling': '/dashboard/mitarbeitercontrolling',
    'einlagencontrolling': '/dashboard/einlagencontrolling',
    'fusubungen': '/dashboard/foot-exercises',
    'musterzettel': '/dashboard/musterzettel',
    'einstellungen': '/dashboard/settings',
    'news_and_aktuelles': '/dashboard/news',
    'produktkatalog': '/dashboard/products',
    'balance': '/dashboard/balance-dashboard',
    'automatisierte_nachrichten': '/dashboard/automatisierte-nachrichten',
    'kasse_and_abholungen': '/dashboard/kasse',
    'finanzen_and_kasse': '/dashboard/finanzen-kasse',
    'einnahmen_and_rechnungen': '/dashboard/einnahmen',
  };
  
  return pathMap[key] || '/dashboard';
};

// Build features list from permissions keys (for edit mode)
export const buildFeaturesFromPermissions = (permissions: Record<string, boolean>): FeatureItem[] => {
  return Object.keys(permissions).map(key => ({
    title: getTitleForPermissionKey(key),
    action: true,
    path: getPathForPermissionKey(key),
    nested: []
  }));
};

type FeatureItem = {
  title: string;
  action: boolean;
  path: string;
  nested?: {
    title: string;
    path: string;
    action: boolean;
  }[];
};

