"use client";
import axios from "@/utils/axiosInstance";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import {
  Timer,
  Wallet,
  BellRing,
  TrendingUp,
  TrendingDown,
  LineChart,
} from "lucide-react";
import { IconReceipt, IconTable } from "@tabler/icons-react";
import { useSocket } from "@/context/SocketContext";
import { OrderDetails } from "@repo/ui/types/Order";
import { Skeleton } from "@repo/ui/components/skeleton";
import OrderCard from "@/components/order-card";
import { cn } from "@repo/ui/lib/utils";

const Page = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [todayOrders, setTodayOrders] = useState<OrderDetails>(null);
  const [stats, setStats] = useState<{
    newOrders: number;
    inProgressOrders: number;
    occupiedTables: number;
    freeTables: number;
    todayTotalOrders: number;
    totalOrderChangePercent: number;
  }>({
    newOrders: 0,
    inProgressOrders: 0,
    occupiedTables: 0,
    freeTables: 0,
    todayTotalOrders: 0,
    totalOrderChangePercent: 0,
  });
  const dispatch = useDispatch();
  const router = useRouter();
  const socket = useSocket();

  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const [orderResponse, statsResponse] = await Promise.all([
        axios.get(`/order/${slug}/?date=today`),
        axios.get(`/restaurant/${slug}/staff-dashboard-stats`),
      ]);
      if (orderResponse.data.success) {
        setTodayOrders(orderResponse.data.data);
      } else {
        setTodayOrders(null);
        toast.error(orderResponse.data.message);
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      } else {
        toast.error(statsResponse.data.message);
      }
    } catch (error) {
      console.error(
        "Failed to fetch dashboard stats. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch dashboard stats. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setIsPageLoading(false);
    }
  }, [slug, router, dispatch]);

  useEffect(() => {
    fetchDashboardStats();
  }, [slug, fetchDashboardStats]);

  useEffect(() => {
    socket?.on("newOrder", () => {
      setStats((prev) => ({
        ...prev,
        newOrders: prev.newOrders + 1,
      }));
    });

    return () => {
      socket?.off("newOrder");
    };
  }, [socket]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  New Orders
                </CardTitle>
                <BellRing className="size-4" />
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-foreground">
                  {stats.newOrders}
                </h3>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Progress
                </CardTitle>
                <Timer className="size-4" />
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold">{stats.inProgressOrders}</h3>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Occupied Tables
                </CardTitle>
                <IconTable className="size-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{stats.occupiedTables}</h3>
                  <p className="text-xs text-muted-foreground">
                    {stats.freeTables} Tables Available
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today&apos;s Total Orders
                </CardTitle>
                <IconReceipt className="size-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">
                    {stats.todayTotalOrders}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      {stats.totalOrderChangePercent > 0 ? (
                        <TrendingUp className="inline size-4 text-green-500" />
                      ) : stats.totalOrderChangePercent < 0 ? (
                        <TrendingDown className="inline size-4 text-red-500" />
                      ) : (
                        <LineChart className="inline size-4" />
                      )}
                      {stats.totalOrderChangePercent > 0 && "+"}
                      <span
                        className={cn("text-xs", {
                          "text-green-500": stats.totalOrderChangePercent > 0,
                          "text-red-500": stats.totalOrderChangePercent < 0,
                        })}
                      >
                        {stats.totalOrderChangePercent.toFixed(0)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        vs yesterday
                      </span>
                    </div>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Order List</h3>
                <Input placeholder="Search a Order" className="mb-4" />
                {isPageLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton
                        key={i + Math.random()}
                        className="h-6 w-full"
                      />
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {todayOrders && todayOrders.orders.length > 0 ? (
                      todayOrders?.orders.map((order) => (
                        <OrderCard
                          key={order._id}
                          order={order}
                          restaurantSlug={slug}
                        />
                      ))
                    ) : (
                      <li className="flex justify-between items-center">
                        <span>No orders found</span>
                      </li>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Payment</h3>
                <Input placeholder="Search a Order" className="mb-4" />
                <ul className="space-y-2 text-sm">
                  {[
                    "A9 Maja Becker",
                    "C2 Erwan Richard",
                    "A2 Stefan Meijer",
                    "A3 Julie Madsen",
                    "B4 Aulia Julie",
                    "B7 Emma Fortin",
                    "TA Mason Groves",
                  ].map((name, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>{name}</span>
                      <Button variant="outline" className="text-xs">
                        <Wallet size={14} className="mr-1" /> Pay Now
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
