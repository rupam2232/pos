"use client";

import { useEffect } from "react";
import { RootState } from "@/store/store";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";
import { useSelector } from "react-redux";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@repo/ui/components/scroll-area";

export function Providers({ children }: { children: React.ReactNode }) {
  const activeRestaurantId = useSelector(
    (state: RootState) => state.restaurantsSlice.activeRestaurant?._id
  );
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !activeRestaurantId) return;
    const handleConnect = () => {
      socket.emit("authenticate", activeRestaurantId);
      console.log(
        "Emitted authenticate event with restaurant ID:",
        activeRestaurantId,
        socket.id
      );
    };

    // If already connected, emit immediately
    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);

      socket.on("newOrder", (data) => {
        toast.success(data.message);
      });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("newOrder");
    };
  }, [activeRestaurantId, socket]);

  return (
    <SidebarProvider
      style={
        {
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <ScrollArea className="h-screen md:h-[96vh] w-full">
          <>
            <SiteHeader />
            {children}
          </>
          <ScrollBar
            orientation="vertical"
            className="z-12"
            thumbClassName="bg-zinc-300 dark:bg-zinc-600"
          />
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
