"use client";

import { useEffect } from "react";
import { RootState } from "@/store/store";
import { getSocket } from "@/utils/socket";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // if (!accessToken || !activeRestaurantId) return;
    const socket = getSocket();
    socket.on("connect", () => console.log("Connected!", socket.id));
    socket.on("connect_error", (err) => console.error("Connect error:", err));
    socket.on("disconnect", () => console.log("Disconnected"));

    // socket.emit("authenticate", "123", "dominos");

    socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);
  
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
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
