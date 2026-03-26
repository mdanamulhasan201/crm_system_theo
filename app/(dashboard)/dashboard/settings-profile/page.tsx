import { Suspense } from "react";
import SettingsProfileTabs from "@/components/DashboardSettings/SettingsProfileTabs";

export default function SettingsProfilePage() {
  return (
    <Suspense fallback={null}>
      <SettingsProfileTabs />
    </Suspense>
  );
}
