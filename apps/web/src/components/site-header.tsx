"use client";
import { Separator } from "@repo/ui/components/separator";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { useEffect, useState } from "react";
import ToggleTheme from "./toggle-Theme";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Avatar, AvatarImage } from "@repo/ui/components/avatar";

export function SiteHeader() {
  const [currentTime, setCurrentTime] = useState<null | Date>(null);
  const pathname = usePathname();
  const activeRestaurant = useSelector(
    (state: RootState) => state.restaurantsSlice.activeRestaurant
  );

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now);
  };

  useEffect(() => {
    setInterval(updateTime, 1000);
  }, []);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {pathname.startsWith("/restaurant/") && (
          <h1 className="text-base font-medium flex items-center">
            <Avatar className="w-7 h-7 mr-2">
              <AvatarImage
                src={activeRestaurant?.logoUrl || "/placeholder-logo.png"}
                alt={
                  activeRestaurant?.restaurantName
                    ? `${activeRestaurant.restaurantName} Logo`
                    : "Placeholder Logo"
                }
                className="object-cover"
                loading="lazy"
                draggable={false}
              />
            </Avatar>
            <span>{activeRestaurant?.restaurantName}</span>
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-5 rotate-12 bg-zinc-400"
            />
            <span>
              {(() => {
                const segment = pathname?.slice(1).split("/")[2];
                return segment
                  ? segment.charAt(0).toUpperCase() + segment.slice(1)
                  : "";
              })()}
            </span>
          </h1>
        )}
        <div className="ml-auto flex items-center gap-2">
          <ToggleTheme />
          {currentTime ? (
            <span className="text-sm text-gray-500">
              {`${currentTime
                .toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })
                .toUpperCase()}`}
              {`, `}
              {`${currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "2-digit",
              })}`}
            </span>
          ) : (
            <span className="text-sm text-gray-500">Loading time...</span>
          )}
        </div>
      </div>
    </header>
  );
}
