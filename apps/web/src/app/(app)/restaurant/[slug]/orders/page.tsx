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
import type { Orders } from "@repo/ui/types/Order";
import { Badge } from "@repo/ui/components/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

type OrderDetails = {
  orders: Orders[];
  page: number;
  limit: number;
  totalPages: number;
  totalOrders: number;
} | null;

const Page = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tabName, setTabName] = useState<string>("all");
  const [allOrders, setAllOrders] = useState<OrderDetails>(null);
  const [newOrders, setNewOrders] = useState<OrderDetails>(null);
  const [inProgressOrders, setInProgressOrders] = useState<OrderDetails>(null);
  const [readyOrders, setReadyOrders] = useState<OrderDetails>(null);
  const [unpaidOrders, setUnpaidOrders] = useState<OrderDetails>(null);
  const [completedOrders, setCompletedOrders] = useState<OrderDetails>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/order/${slug}`);
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.orders)
      ) {
        setAllOrders(response.data.data);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : !Array.isArray(allOrders?.orders) ||
              allOrders.orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              allOrders.orders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="space-y-2">
                    {/* Header */}
                      <div>
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span>Table: {order.table.tableName}</span>
                          <Badge variant="default" className="ml-1">
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          Order #{order._id}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground flex items-center justify-between">
                        <p>
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            }
                          )}
                        </p>
                        <p>
                          {new Date(order.createdAt)
                            .toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            .toUpperCase()}
                        </p>
                      </div>

                    {/* Order items */}
                    <div className="border-t pt-2 text-sm space-y-1">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-left">Items</TableHead>
                            <TableHead className="text-center">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.orderedFoodItems.map((item, index) => (
                            <TableRow key={item.foodItemId + index}>
                              <TableCell className="font-medium flex items-center gap-2 text-left">
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span
                                      className={`${item.foodType === "veg" ? "bg-green-500" : ""} ${item.foodType === "non-veg" ? "bg-red-500" : ""} w-2 h-2 outline outline-primary border-2 border-background block rounded-full cursor-help`}
                                    ></span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {item.foodType === "veg"
                                      ? "Veg"
                                      : item.foodType === "non-veg"
                                        ? "Non Veg"
                                        : "Vegan"}
                                  </TooltipContent>
                                </Tooltip>
                                <span>
                                  {item.isVariantOrder
                                    ? item.variantName
                                    : item.foodName}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{item.price.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell className="text-left">Total</TableCell>
                            <TableCell className="text-center">{order.orderedFoodItems.reduce((prv, item)=> prv + item.quantity, 0)}</TableCell>
                            <TableCell className="text-right">
                              ₹{order.finalAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 justify-between">
                      <Button variant="outline">See Details</Button>
                      <Button>Pay Bills</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
