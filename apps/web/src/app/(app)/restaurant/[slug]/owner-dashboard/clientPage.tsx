"use client";
import axios from "@/utils/axiosInstance";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
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
import { Timer, BellRing, Loader2 } from "lucide-react";
import { IconReceipt, IconTable } from "@tabler/icons-react";
import { useSocket } from "@/context/SocketContext";
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
import { setActiveRestaurant } from "@/store/restaurantSlice";
import { OwnerDashboardStats } from "@repo/ui/types/Stats";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

const ClientPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<OwnerDashboardStats>();

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const socket = useSocket();
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
      const statsResponse = await axios.get(
        `/restaurant/${slug}/owner-dashboard-stats`
      );

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
        router.push(
          "/signin?redirect=/restaurant/" + slug + "/owner-dashboard"
        );
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
      router.refresh();
    });

    return () => {
      socket?.off("newOrder");
    };
  }, [socket, router]);

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
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push(
          "/signin?redirect=/restaurant/" + slug + "/owner-dashboard"
        );
      }
    }
  };

  if (isPageLoading) {
    return (
      <div className="h-[95vh] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <div className="flex justify-between items-center px-6 pt-2">
          {user?.role === "owner" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="inline-flex cursor-pointer gap-2">
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
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRestaurantCurrentlyOpen
                      ? "This will close the restaurant and stop accepting orders."
                      : "This will open the restaurant and start accepting orders."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleToggleRestaurantStatus}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex flex-col gap-4 md:gap-6 p-4 pt-2! lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </CardTitle>
                <BellRing className="size-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">
                    {stats?.kpis.totalSales.value}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {stats?.kpis.totalSales.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Completed Orders
                </CardTitle>
                <Timer className="size-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">
                    {stats?.kpis.totalCompletedOrders.value}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {stats?.kpis.totalCompletedOrders.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </CardTitle>
                <IconTable className="size-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">
                    {stats?.kpis.avgOrderValue.value}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {stats?.kpis.avgOrderValue.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unpaid Orders
                </CardTitle>
                <IconReceipt className="size-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">
                    {stats?.kpis.unpaidOrders.value}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {stats?.kpis.unpaidOrders.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <ChartAreaInteractive />
            </div>
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
