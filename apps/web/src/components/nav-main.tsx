"use client";

import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url?: string;
    showInSidebar: boolean;
    icon?: Icon;
    subItems?: {
      title: string;
      url: string;
      icon?: Icon;
    }[];
  }[];
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map(
            (item) =>
              item.showInSidebar &&
              (item.subItems && item.subItems.length > 0 ? (
                <div key={item.title} className="space-y-1">
                  <SidebarGroupLabel className="text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden mb-0!">{item.title}</SidebarGroupLabel>
                  {item.subItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.title + subItem.url}>
                      <Link
                        href={subItem.url}
                      >
                        <SidebarMenuButton
                          className={`cursor-pointer ${pathname === subItem.url ? "bg-accent-foreground hover:bg-accent-foreground/90 font-medium text-sidebar-accent hover:text-sidebar-accent" : "text-sidebar-accent-foreground"}`}
                          tooltip={subItem.title}
                        >
                          {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </div>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <Link
                    href={item.url ?? "#"}
                  >
                    <SidebarMenuButton
                      className={`cursor-pointer ${pathname === item.url ? "bg-accent-foreground hover:bg-accent-foreground/90 font-medium text-sidebar-accent hover:text-sidebar-accent" : "text-sidebar-accent-foreground"}`}
                      tooltip={item.title}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
