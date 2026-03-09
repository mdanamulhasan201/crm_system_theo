"use client";

import React, { useState } from "react";
import TabConfig, { type SchedulingTab } from "../_components/SchedulingConfig/TabConfig";
import { TabsContent } from "@/components/ui/tabs";
import StaffAvailability from "../_components/SchedulingConfig/StaffAvailability";
import Rooms from "../_components/SchedulingConfig/Rooms";
import BookingRules from "../_components/SchedulingConfig/BookingRules";

export default function SchedulingConfigPage() {
  const [activeTab, setActiveTab] = useState<SchedulingTab>("staff-availability");

  return (
    <div className="w-full">
      <TabConfig value={activeTab} onValueChange={setActiveTab}>
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
