"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReceipt,
  IconReport,
  IconSearch,
  IconSettings,
  IconTable,
  IconToolsKitchen,
  IconUsers,
  IconCash,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { usePathname } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconListDetails,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconReceipt,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector((state: RootState) => state.auth.user);
  const pathname = usePathname();

  const isRestaurantPage = pathname?.slice(1).split("/")[0] === "restaurant";

let restaurantSlug = "";
if (isRestaurantPage) {
  restaurantSlug = pathname?.slice(1).split("/")[1] || "";
}

  const restaurantNavData = [
    {
      title: "Dashboard",
      url: `/restaurant/${restaurantSlug}/dashboard`,
      icon: IconListDetails,
    },
    {
      title: "Orders",
      url: `/restaurant/${restaurantSlug}/orders`,
      icon: IconReceipt,
    },
    {
      title: "Tables",
      url: `/restaurant/${restaurantSlug}/tables`,
      icon: IconTable,
    },
    {
      title: "Menu",
      url: `/restaurant/${restaurantSlug}/menu`,
      icon: IconToolsKitchen,
    },
    {
      title: "Billing",
      url: `/restaurant/${restaurantSlug}/billing`,
      icon: IconDatabase,
    },
    {
      title: "Payments",
      url: `/restaurant/${restaurantSlug}/payments`,
      icon: IconCash,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  {process.env.NEXT_PUBLIC_APP_NAME}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain
            items={
              isRestaurantPage
                ? restaurantNavData
                : data.navMain
            }
          />
          {!isRestaurantPage && <NavDocuments items={data.documents} />}
          {!isRestaurantPage && <NavSecondary items={data.navSecondary} className="mt-auto" />}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
