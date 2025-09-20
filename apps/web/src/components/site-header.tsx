"use client";
import { Separator } from "@repo/ui/components/separator";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { useEffect, useRef, useState } from "react";
import ToggleTheme from "./toggle-Theme";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Avatar, AvatarImage } from "@repo/ui/components/avatar";

export function SiteHeader() {
  const [currentTime, setCurrentTime] = useState<null | Date>(null);
  const pageTitle = useRef<string>("");
  const pathname = usePathname();
  const activeRestaurant = useSelector(
    (state: RootState) => state.restaurantsSlice.activeRestaurant
  );

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now);
  };

  useEffect(() => {
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    (() => {
      if (pathname.startsWith("/restaurant/")) {
        const segment = pathname?.slice(1).split("/")[2];
        pageTitle.current = segment
          ? segment
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : "";
      } else {
        const segment = pathname?.slice(1).split("/")[0];
        pageTitle.current = segment
          ? segment
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : "";
      }
    })();
  }, [pathname]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-10 px-1 backdrop-blur-sm bg-background/70">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {pathname.startsWith("/restaurant/") ? (
          <div className="text-base font-medium flex items-center space-x-2">
            <Avatar className="w-7 h-7">
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
            <div className="flex items-center">
              <span>{activeRestaurant?.restaurantName}</span>
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-5 bg-zinc-400"
              />
              <span>{pageTitle.current}</span>
            </div>
            {activeRestaurant?.isCurrentlyOpen ? (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <p className="text-sm">Open</p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <p className="text-sm">Closed</p>
              </div>
            )}
          </div>
        ) : (
          <h3 className="text-base font-medium">{pageTitle.current}</h3>
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
