"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import axios from "@/utils/axiosInstance";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { ApiResponse } from "@repo/ui/types/ApiResponse";

const Page = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tabName, setTabName] = useState<string>("all");
  const [allOrders, setAllOrders] = useState([]);
  const [newOrders, setNewOrders] = useState([]);
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/order/${slug}`);
      if (
        response.data.data.orders &&
        Array.isArray(response.data.data.orders)
      ) {
        setAllOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error(
        "Failed to fetch all orders. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch all orders. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, router, dispatch]);

  useEffect(() => {
    if (!slug) {
      toast.error("Restaurant slug is required");
      return;
    }
    switch (tabName) {
      case "all":
        fetchAllOrders();
        break;
      case "new":
        break;
      case "inProgress":
        break;
      case "ready":
        break;
      case "unPaid":
        break;
      case "completed":
        break;

      default:
        break;
    }
  }, [tabName, slug]);

  return (
    <div className="flex flex-1 flex-col p-4 md:gap-6 lg:p-6">
      {/* <div className="flex flex-1 flex-col gap-2">
            <h1 className="text-2xl font-bold">Orders for {slug}</h1>
            <p className="text-gray-500">This page will display all orders for the restaurant: {slug}</p>
        </div> */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger
            value="all"
            className="font-medium data-[state=active]:font-semibold"
            onClick={() => setTabName("all")}
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="new"
            className="font-medium data-[state=active]:font-semibold"
            onClick={() => setTabName("new")}
          >
            New
          </TabsTrigger>
          <TabsTrigger
            value="inProgress"
            className="font-medium data-[state=active]:font-semibold"
            onClick={() => setTabName("inProgress")}
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="ready"
            className="font-medium data-[state=active]:font-semibold"
            onClick={() => setTabName("ready")}
          >
            Ready
          </TabsTrigger>
          <TabsTrigger
            value="unPaid"
            className="font-medium data-[state=active]:font-semibold"
            onClick={() => setTabName("unPaid")}
          >
            Unpaid
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="font-medium data-[state=active]:font-semibold"
            onClick={() => setTabName("completed")}
          >
            Completed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
            <Card>
                <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>
                    This tab displays all orders for the restaurant: {slug}
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    !Array.isArray(allOrders) || allOrders.length === 0 ? (
                    <p>No orders found.</p>
                    ) : (
                    allOrders.map((order) => (
                    <div key={order.id} className="border p-4 rounded-md">
                        <h3 className="font-semibold">Order ID: {order.id}</h3>
                        <p>Status: {order.status}</p>
                        {/* Add more order details as needed */}
                    </div>
                    ))
                ))}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="inProgress">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you&apos;ll be logged
                out.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-current">Current password</Label>
                <Input id="tabs-demo-current" type="password" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-new">New password</Label>
                <Input id="tabs-demo-new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
