import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import type {
  Order,
  OrderDetails as OrderDetailsType,
  FullOrderDetailsType,
} from "@repo/ui/types/Order";
import axios from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { ApiResponse } from "@repo/ui/types/ApiResponse";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Badge } from "@repo/ui/components/badge";
import { BellRing, BookCheck, CheckCheck, Soup, Timer } from "lucide-react";
import { IconReceiptOff } from "@tabler/icons-react";
import {
  Table,
  TableBody,
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
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

const OrderDetails = ({
  children,
  order,
  setOrders,
  restaurantSlug,
}: {
  children: React.ReactNode;
  order: Order;
  setOrders: React.Dispatch<React.SetStateAction<OrderDetailsType>>;
  restaurantSlug: string;
}) => {
  const [orderDetails, setOrderDetails] = useState<FullOrderDetailsType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/order/${restaurantSlug}/${order._id}`);
      if (response.data && response.data.data) {
        setOrderDetails(response.data.data);
      } else {
        setError("Something went wrong. Please try again later");
      }
    } catch (error) {
      console.error(
        "Failed to fetch all orders. Please try again later:",
        error
      );
      setError(
        (error as AxiosError<ApiResponse>).response?.data.message ||
          "Failed to fetch all orders. Please try again later"
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
  }, [restaurantSlug, order._id, dispatch, router]);

  const onChildBtnClick = () => {
    if (order._id !== orderDetails?._id) {
      fetchOrderDetails();
    }
  };

  const orderStatusIcons = [
    {
      status: "pending",
      icon: <BellRing />,
      message: "New Order",
      color: "bg-yellow-500 text-white",
    },
    {
      status: "preparing",
      icon: <Timer />,
      message: "Cooking now",
      color: "bg-orange-500 text-white",
    },
    {
      status: "ready",
      icon: <CheckCheck />,
      message: "Ready to serve",
      color: "bg-green-500 text-white",
    },
    {
      status: "served",
      icon: <Soup />,
      message: "Food on the table",
      color: "bg-blue-500 text-white",
    },
    {
      status: "completed",
      icon: <BookCheck />,
      message: "Payement done. Order completed",
      color: "bg-purple-500 text-white",
    },
    {
      status: "cancelled",
      icon: <IconReceiptOff />,
      message: "Order cancelled",
      color: "bg-red-500 text-white",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger
        asChild
        onClick={() => onChildBtnClick()}
        className="text-primary bg-background hover:bg-accent transition-all duration-200"
      >
        {children}
      </DialogTrigger>
      <DialogContent className="">
        <ScrollArea className="h-full">
          <DialogHeader className="p-4">
            <DialogTitle>
              Order Details
              {/* <p>Table: {order.table.tableName}</p>
              <p>Order: {order._id}</p> */}
            </DialogTitle>
            <DialogDescription>
              View and manage the details of this order, including food items,
              status, and payment information.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : orderDetails ? (
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Table: {orderDetails.table.tableName}</span>
                <div className="relative">
                  <Badge
                    variant="default"
                    className={`${
                      orderStatusIcons.find(
                        (icon) => icon.status === orderDetails.status
                      )?.color || ""
                    }`}
                  >
                    {orderStatusIcons.find(
                      (icon) => icon.status === orderDetails.status
                    )?.icon || "❓"}
                    {orderDetails.status.charAt(0).toUpperCase() +
                      orderDetails.status.slice(1)}
                  </Badge>
                  <div className="absolute -bottom-5 right-0 text-[10px] flex items-center gap-1 text-muted-foreground">
                    <span
                      className={`${
                        orderStatusIcons.find(
                          (icon) => icon.status === orderDetails.status
                        )?.color || ""
                      } w-1 h-1 rounded-full block`}
                    ></span>
                    {orderStatusIcons.find(
                      (icon) => icon.status === orderDetails.status
                    )?.message || ""}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-xs mt-0.5">
                Order #{orderDetails._id}
              </p>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Payment Status</Label>
                <Badge
                  variant={orderDetails.isPaid ? "success" : "destructive"}
                  className="text-xs"
                >
                  {orderDetails.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              <div className="text-right text-xs text-muted-foreground flex items-center justify-between">
                <p>
                  {new Date(orderDetails.createdAt).toLocaleDateString(
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
                  {new Date(orderDetails.createdAt)
                    .toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toUpperCase()}
                </p>
              </div>

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
                    {orderDetails.orderedFoodItems.map((item, index) => (
                      <TableRow
                        key={item.foodItemId + index}
                        className="text-primary/80"
                      >
                        <TableCell className="font-medium flex items-center gap-2 text-left">
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className={`border border-primary p-0.5 cursor-help`}
                              >
                                <span
                                  className={`${item.foodType !== "veg" ? "bg-green-500" : ""} ${item.foodType === "non-veg" ? "bg-red-500" : ""} w-1.5 h-1.5 block rounded-full`}
                                ></span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {item.foodType === "veg"
                                ? "Veg"
                                : item.foodType === "non-veg"
                                  ? "Non Veg"
                                  : "Vegan"}
                            </TooltipContent>
                          </Tooltip>
                          
                            <Avatar>
                              <AvatarImage
                                src={
                                  item.firstImageUrl
                                    ? item.firstImageUrl
                                    : "/images/placeholder.png"
                                }
                                alt={item.foodName}
                                className="w-8 h-8 object-cover rounded-md"
                              />
                              <AvatarFallback className="rounded-md">
                                {item.isVariantOrder
                                  ? item.variantDetails?.variantName[0]?.toUpperCase()
                                  : item.foodName[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          
                          <span>
                            {item.isVariantOrder
                              ? item.variantDetails?.variantName
                              : item.foodName}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{item.finalPrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="text-left">Total</TableCell>
                      <TableCell className="text-center">
                        {orderDetails.orderedFoodItems.reduce(
                          (prv, item) => prv + item.quantity,
                          0
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{orderDetails.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Order Note</h3>
                <p className="text-sm bg-muted px-3 py-1 rounded-md">
                  {orderDetails.notes}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-red-500 text-center">
              No order details found. Please try again later.
            </div>
          )}
          <DialogFooter className="p-4 flex justify-between! items-center w-full flex-row">
            <Button type="submit">Save changes</Button>
            <Button variant="outline">Close</Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetails;
