"use client";

import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@repo/ui/components/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

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
                <Collapsible
                  defaultOpen={true}
                  className="group/collapsible"
                  key={item.title}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        {item.icon && <item.icon />}
                        {item.title}
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="mr-0 pr-0">
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title + subItem.url}>
                            <Link
                              href={subItem.url}
                              className={`${pathname === subItem.url ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
                            >
                              <SidebarMenuButton
                                className={`cursor-pointer ${pathname === subItem.url ? "bg-accent-foreground hover:bg-accent-foreground/90 font-medium text-sidebar-accent hover:text-sidebar-accent" : ""}`}
                                tooltip={item.title}
                              >
                                {subItem.icon && <subItem.icon />}
                                <span>{subItem.title}</span>
                              </SidebarMenuButton>
                            </Link>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <Link
                    href={item.url ?? "#"}
                    className={`${pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
                  >
                    <SidebarMenuButton
                      className={`cursor-pointer ${pathname === item.url ? "bg-accent-foreground hover:bg-accent-foreground/90 font-medium text-sidebar-accent hover:text-sidebar-accent" : ""}`}
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
