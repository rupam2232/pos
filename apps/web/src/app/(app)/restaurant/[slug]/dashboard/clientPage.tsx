"use client";
import axios from "@/utils/axiosInstance";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector, } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import {
  Timer,
  Wallet,
  BellRing,
  TrendingUp,
  TrendingDown,
  LineChart,
  Plus,
  CheckCheck,
} from "lucide-react";
import { IconReceipt, IconTable } from "@tabler/icons-react";
import { useSocket } from "@/context/SocketContext";
import { OrderDetails } from "@repo/ui/types/Order";
import { Skeleton } from "@repo/ui/components/skeleton";
import OrderCard from "@/components/order-card";
import { cn } from "@repo/ui/lib/utils";
import { AllTables } from "@repo/ui/types/Table";
import Link from "next/link";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import type { RootState, AppDispatch } from "@/store/store";
import {
  setActiveRestaurant,
} from "@/store/restaurantSlice";

const Page = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [latestOrders, setLatesOrders] = useState<OrderDetails>(null);
  const [stats, setStats] = useState<{
    newOrders: number;
    inProgressOrders: number;
    occupiedTables: number;
    freeTables: number;
    todayTotalOrders: number;
    totalOrderChangePercent: number;
    unPaidCompletedOrders: number;
    readyOrders: number;
  }>({
    newOrders: 0,
    inProgressOrders: 0,
    occupiedTables: 0,
    freeTables: 0,
    todayTotalOrders: 0,
    totalOrderChangePercent: 0,
    unPaidCompletedOrders: 0,
    readyOrders: 0,
  });
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const socket = useSocket();
  const [allTables, setAllTables] = useState<AllTables | null>(null);
  const [isRestaurantCurrentlyOpen, setIsRestaurantCurrentlyOpen] = useState(
    useSelector(
      (state: RootState) =>
        state.restaurantsSlice.activeRestaurant?.isCurrentlyOpen
    )
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const [orderResponse, statsResponse] = await Promise.all([
        axios.get(`/order/${slug}`),
        axios.get(`/restaurant/${slug}/staff-dashboard-stats`),
      ]);
      if (orderResponse.data.success) {
        setLatesOrders(orderResponse.data.data);
      } else {
        setLatesOrders(null);
        toast.error(orderResponse.data.message);
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      } else {
        toast.error(statsResponse.data.message);
      }

      const tableResponse = await axios.get(`/table/${slug}`);
      setAllTables(tableResponse.data.data);
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

  const handleToggleRestaurantStatus = async () => {
    try {
      const response = await axios.post(
        `/restaurant/${slug}/toggle-open-status`
      );
      if (response.data.success) {
        setIsRestaurantCurrentlyOpen(response.data.data.isCurrentlyOpen);
        dispatch(setActiveRestaurant(response.data.data));
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Failed to toggle restaurant status:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to toggle restaurant status. Please try again later"
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        {user?.role === "owner" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="inline-flex cursor-pointer px-4 pt-4 w-max gap-2">
                <Switch
                  id="toggle-restaurant-status"
                  checked={isRestaurantCurrentlyOpen}
                  className="cursor-pointer"
                />
                <Label className="cursor-pointer">
                  {isRestaurantCurrentlyOpen
                    ? "Close restaurant"
                    : "Open restaurant"}
                </Label>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {isRestaurantCurrentlyOpen
                    ? "This will close the restaurant and stop accepting orders."
                    : "This will open the restaurant and start accepting orders."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleToggleRestaurantStatus}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <div className="flex flex-col gap-4 md:gap-6 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  New Orders
                </CardTitle>
                <BellRing className="size-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{stats.newOrders}</h3>
                  <p className="text-xs text-muted-foreground">
                    *Updates in real-time
                  </p>
                </div>
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
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">
                    {stats.inProgressOrders}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    *Orders that are in preparing status
                  </p>
                </div>
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
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {stats.totalOrderChangePercent > 0 ? (
                      <TrendingUp className="inline size-4 text-green-500" />
                    ) : stats.totalOrderChangePercent < 0 ? (
                      <TrendingDown className="inline size-4 text-red-500" />
                    ) : (
                      <LineChart className="inline size-4" />
                    )}
                    <span
                      className={cn("text-xs", {
                        "text-green-500": stats.totalOrderChangePercent > 0,
                        "text-red-500": stats.totalOrderChangePercent < 0,
                      })}
                    >
                      {stats.totalOrderChangePercent > 0 ? "+" : ""}
                      {stats.totalOrderChangePercent.toFixed(0)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs yesterday
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card>
                <CardContent className="flex items-center justify-center">
                  <CardAction className="w-[80%]">
                    <Link href={`/restaurant/${slug}/dashboard/new-order`}>
                      <Button className="w-full">
                        <Plus />
                        Create New Order
                      </Button>
                    </Link>
                  </CardAction>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Ready to Serve
                  </CardTitle>
                  <CheckCheck className="size-4" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {stats.readyOrders}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Orders ready and awaiting service
                      </p>
                    </div>
                    <Link href={`/restaurant/${slug}/orders`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Pending Payments
                  </CardTitle>
                  <Wallet className="size-4" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {stats.unPaidCompletedOrders}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Orders completed but not paid
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Settle
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* <Card>
                  <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      Avg Preparation
                    </CardTitle>
                    <Clock className="size-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">
                          {demoAvgPrepMinutes} min
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Average prep time (today)
                        </p>
                      </div>
                      <Button size="sm" variant="ghost">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card> */}

              {/* <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {demoRecentActivity.map((act) => (
                      <li
                        key={act.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Activity className="size-4 text-muted-foreground" />
                          <span>{act.text}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {act.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card> */}

              <Card>
                <CardHeader className="flex items-center justify-between text-muted-foreground text-sm">
                  <CardTitle>Table Map</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span>
                        Available: {allTables ? allTables.availableTables : 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <span>
                        Occupied: {allTables ? allTables.occupiedTables : 0}
                      </span>
                    </div>
                  </div>
                  {allTables?.totalPages && allTables?.totalPages > 1 && (
                    <Link
                      href={`/restaurant/${slug}/tables`}
                      className="text-sm text-primary hover:underline"
                    >
                      View all tables
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {allTables?.tables.map((t) => (
                      <div
                        key={t._id}
                        className={cn(
                          "rounded-md p-3 flex flex-col items-center justify-center text-sm truncate",
                          t.isOccupied
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : "bg-green-50 text-green-700 border border-green-100"
                        )}
                      >
                        <h3 className="font-medium">{t.tableName}</h3>
                        <div className="text-xs">
                          {t.isOccupied ? "Occupied" : "Available"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((a) => {
                      const Icon = a.icon as any;
                      return (
                        <Button key={a.id} size="sm" variant="outline">
                          <Icon className="size-4 mr-2 inline" />
                          {a.label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card> */}
            </div>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  Order List
                </CardTitle>
                {latestOrders && latestOrders.totalPages > 1 && (
                  <Link
                    href={`/restaurant/${slug}/orders`}
                    className="text-sm text-primary hover:underline"
                  >
                    View all orders
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {isPageLoading ? (
                  <ScrollArea className="h-[560px]">
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton
                          key={i + Math.random()}
                          className="h-80 w-full rounded-xl"
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : latestOrders && latestOrders.orders.length > 0 ? (
                  <ScrollArea className="h-[560px]">
                    <div className="space-y-2">
                      {latestOrders?.orders.map((order) => (
                        <OrderCard
                          key={order._id}
                          order={order}
                          restaurantSlug={slug}
                          className="hover:scale-100"
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex justify-between items-center">
                    <span>No orders found</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
