"use client";

import React, { useEffect, useState } from "react";
import TabConfig, { type SchedulingTab } from "../_components/SchedulingConfig/TabConfig";
import { TabsContent } from "@/components/ui/tabs";
import StaffAvailability from "../_components/SchedulingConfig/StaffAvailability";
import Rooms from "../_components/SchedulingConfig/Rooms";
import BookingRules from "../_components/SchedulingConfig/BookingRules";
import { useSearchParams, useRouter } from "next/navigation";

export default function SchedulingConfigPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getInitialTab = (): SchedulingTab => {
    const tabParam = searchParams?.get("tab") as SchedulingTab | null;
    if (tabParam === "rooms" || tabParam === "booking-rules" || tabParam === "staff-availability") {
      return tabParam;
    }
    return "staff-availability";
  };

  const [activeTab, setActiveTab] = useState<SchedulingTab>(getInitialTab);

  // Keep state in sync if the URL tab changes (e.g. via back/forward)
  useEffect(() => {
    const fromParams = searchParams?.get("tab") as SchedulingTab | null;
    if (fromParams && fromParams !== activeTab) {
      if (fromParams === "rooms" || fromParams === "booking-rules" || fromParams === "staff-availability") {
        setActiveTab(fromParams);
      }
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (value: SchedulingTab) => {
    setActiveTab(value);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", value);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <TabConfig value={activeTab} onValueChange={handleTabChange}>
        <TabsContent value="staff-availability" className="mt-0 outline-none">
          <StaffAvailability />
        </TabsContent>
        <TabsContent value="rooms" className="mt-0 outline-none">
          <Rooms />
        </TabsContent>
        <TabsContent value="booking-rules" className="mt-0 outline-none">
          <BookingRules />
        </TabsContent>
      </TabConfig>
    </div>
  );
}
