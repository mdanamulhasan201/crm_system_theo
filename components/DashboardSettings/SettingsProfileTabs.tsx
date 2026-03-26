"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicSettings from "@/components/DashboardSettings/BasicSettings";
import OrdersFieldSettings from "@/components/DashboardSettings/OrdersFieldSettings";

const TAB_CUSTOMER = "customer";
const TAB_ORDERS = "orders";

type TabValue = typeof TAB_CUSTOMER | typeof TAB_ORDERS;

function tabFromSearchParams(searchParams: URLSearchParams): TabValue {
  const t = searchParams.get("tab");
  if (t === TAB_ORDERS) return TAB_ORDERS;
  return TAB_CUSTOMER;
}

export default function SettingsProfileTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo(
    () => tabFromSearchParams(searchParams),
    [searchParams]
  );

  const onTabChange = useCallback(
    (value: string) => {
      if (value !== TAB_CUSTOMER && value !== TAB_ORDERS) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full gap-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 sm:w-fit sm:max-w-none">
          <TabsTrigger
            value="customer"
            className="data-[state=active]:bg-[#61A07B] cursor-pointer data-[state=active]:text-white dark:data-[state=active]:bg-[#61A07B] dark:data-[state=active]:text-white"
          >
            Kundeneinstellungen
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-[#61A07B] cursor-pointer data-[state=active]:text-white dark:data-[state=active]:bg-[#61A07B] dark:data-[state=active]:text-white"
          >
            Bestelleinstellungen
          </TabsTrigger>
        </TabsList>
        <TabsContent value="customer" className="mt-0">
          <BasicSettings />
        </TabsContent>
        <TabsContent value="orders" className="mt-0">
          <OrdersFieldSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
