"use client";

import {
    Settings,
    MessageSquare,
    Save,
    Scan,
    Palette,
    Warehouse,
    Monitor,
    FootprintsIcon,
    Lock,
    Store,
    HelpCircle,
    Bell,

} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import SettingsLayout from "@/components/Settings/SettingsLayout";
import { BiGlobe } from "react-icons/bi";
import { GrOrderedList } from "react-icons/gr";
import { useFeatureAccess } from "@/contexts/FeatureAccessContext";

export default function SettingsProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { getNestedForPath, isPathAllowed, loading: featureLoading } = useFeatureAccess();

    const sidebarData = useMemo(() => {
        const allNested = getNestedForPath("/dashboard/settings") || [];

        // Map API nested items to local sidebar structure with icons and ids
        const mapIdFromPath = (path: string) => {
            const parts = path.split("/");
            const last = parts[parts.length - 1] || "";
            if (last === "settings-profile") return "dashboard";
            return last || "dashboard";
        };

        const iconForPath = (path: string) => {
            if (path === "/dashboard/settings-profile") return Settings;
            if (path.endsWith("/backup")) return Save;
            // if (path.endsWith("/communication")) return MessageSquare;
            // if (path.endsWith("/werkstattzettel")) return Warehouse;
            if (path.endsWith("/benachrichtigungen")) return Bell;
            if (path.endsWith("/notifications")) return Store;
            if (path.endsWith("/preisverwaltung")) return Scan;
            // if (path.endsWith("/software-scanstation")) return Monitor;
            // if (path.endsWith("/design")) return Palette;
            if (path.endsWith("/changes-password")) return Lock;
            if (path.endsWith("/sprache")) return BiGlobe;
            if (path.endsWith("/fragen")) return HelpCircle;
            if (path.endsWith("/automatische-orders")) return GrOrderedList;
            if (path.endsWith("/automatisches")) return GrOrderedList;
            return Settings;
        };

        const items = allNested
            .filter((item) => 
                item.action && 
                isPathAllowed(item.path) &&
                !item.path.endsWith("/software-scanstation") &&
                !item.path.endsWith("/design") &&
                !item.path.endsWith("/changes-password") &&
                !item.path.endsWith("/sprache") &&
                !item.path.endsWith("/notifications") &&
                !item.path.endsWith("/communication") &&
                !item.path.endsWith("/werkstattzettel")
            )
            .map((item) => ({
                id: mapIdFromPath(item.path),
                icon: iconForPath(item.path),
                label: item.title,
                href: item.path,
            }));

        // Fallback to static config if API returns nothing (or while loading)
        if (!items.length && featureLoading) {
            return [
                {
                    id: "dashboard",
                    icon: Settings,
                    label: "Grundeinstellungen",
                    href: "/dashboard/settings-profile"
                },
                {
                    id: "backup",
                    icon: Save,
                    label: "Backup Einstellungen",
                    href: "/dashboard/settings-profile/backup"
                },
                // {
                //     id: "communication",
                //     icon: MessageSquare,
                //     label: "Kundenkommunikation",
                //     href: "/dashboard/settings-profile/communication"
                // },
                // {
                //     id: "werkstattzettel",
                //     icon: Warehouse,
                //     label: "Werkstattzettel",
                //     href: "/dashboard/settings-profile/werkstattzettel"
                // },
                {
                    id: "benachrichtigungen",
                    icon: Bell,
                    label: "Benachrichtigungen",
                    href: "/dashboard/settings-profile/benachrichtigungen"
                },
                {
                    id: "notifications",
                    icon: Store,
                    label: "Lagereinstellungen",
                    href: "/dashboard/settings-profile/notifications"
                },
                {
                    id: "preisverwaltung",
                    icon: Scan,
                    label: "Preisverwaltung",
                    href: "/dashboard/settings-profile/preisverwaltung"
                },
                // {
                //     id: "software-scanstation",
                //     icon: Monitor,
                //     label: "Software Scanstation",
                //     href: "/dashboard/settings-profile/software-scanstation"
                // },
                // {
                //     id: "design",
                //     icon: Palette,
                //     label: "Design & Logo",
                //     href: "/dashboard/settings-profile/design"
                // },
                // {
                //     id: "changes-password",
                //     icon: Lock,
                //     label: "Passwort ändern",
                //     href: "/dashboard/settings-profile/changes-password"
                // },
                // {
                //     id: "sprache",
                //     icon: BiGlobe,
                //     label: "Sprache",
                //     href: "/dashboard/settings-profile/sprache"
                // },
                {
                    id: "fragen",
                    icon: HelpCircle,
                    label: "Fragen",
                    href: "/dashboard/settings-profile/fragen"
                },
                {
                    id: "automatische-orders",
                    icon: GrOrderedList,
                    label: "Automatische Orders",
                    href: "/dashboard/settings-profile/automatische-orders"
                },
                {
                    id: "automatische",
                    icon: GrOrderedList,
                    label: "Automatische",
                    href: "/dashboard/settings-profile/automatisches"
                }
            ];
        }

        return items;
    }, [getNestedForPath, isPathAllowed, featureLoading]);

    // Determine active tab based on current path
    const getActiveTab = useCallback(() => {
        const path = pathname.split('/').pop();
        if (path === 'settings-profile') return 'dashboard';
        return path || 'dashboard';
    }, [pathname]);

    const [activeTab, setActiveTab] = useState(getActiveTab());

    useEffect(() => {
        setActiveTab(getActiveTab());
    }, [pathname, getActiveTab]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        const tabItem = sidebarData.find(item => item.id === tabId);
        if (tabItem?.href) {
            router.push(tabItem.href);
        }
    };

    return (
        <SettingsLayout
            sidebarData={sidebarData}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
        >
            {children}
        </SettingsLayout>
    );
} 