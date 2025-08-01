import { useState, useCallback, JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import type {
  Order,
  // OrderDetails as OrderDetailsType,
  FullOrderDetailsType,
} from "@repo/ui/types/Order";
import axios from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { ApiResponse } from "@repo/ui/types/ApiResponse";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@repo/ui/components/scroll-area";
import { Badge } from "@repo/ui/components/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { IconSalad } from "@tabler/icons-react";

const OrderDetails = ({
  children,
  order,
  // setOrders,
  restaurantSlug,
  orderStatusIcons,
  status,
  handleUpdateStatus,
}: {
  children: React.ReactNode;
  order: Order;
  // setOrders: React.Dispatch<React.SetStateAction<OrderDetailsType>>;
  restaurantSlug: string;
  orderStatusIcons: {
    status: string;
    icon: JSX.Element;
    message: string;
    color: string;
    actionLabel?: string;
  }[];
  status: Order["status"];
  handleUpdateStatus: (status: string) => void;
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

  const currentStatusIndex = orderStatusIcons.findIndex(
    (item) => item.status === status
  );

  // Only show statuses after current one (excluding itself)
  const availableNextStatuses = orderStatusIcons.slice(currentStatusIndex + 1);
  return (
    <Dialog>
      <DialogTrigger
        asChild
        onClick={() => onChildBtnClick()}
        className="text-primary bg-background hover:bg-accent transition-all duration-200"
      >
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-screen w-full">
        <ScrollArea className="max-h-[90vh]">
          <DialogHeader className="p-4">
            <DialogTitle>Order Details</DialogTitle>
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
                  {availableNextStatuses.length > 0 &&
                  availableNextStatuses[0]?.status !== "cancelled" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="default"
                              className={`cursor-pointer ${
                                orderStatusIcons.find(
                                  (icon) => icon.status === status
                                )?.color || ""
                              }`}
                            >
                              {orderStatusIcons.find(
                                (icon) => icon.status === status
                              )?.icon || "❓"}
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Click to Change Order Status
                          </TooltipContent>
                        </Tooltip>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {availableNextStatuses.map((status) => {
                          return (
                            <DropdownMenuItem
                              key={status.status}
                              className="cursor-pointer"
                              onClick={() => {
                                handleUpdateStatus(status.status);
                              }}
                            >
                              {status.icon}{" "}
                              {status.actionLabel ||
                                status.status.charAt(0).toUpperCase() +
                                  status.status.slice(1)}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Badge
                      variant="default"
                      className={`cursor-pointer ${
                        orderStatusIcons.find((icon) => icon.status === status)
                          ?.color || ""
                      }`}
                    >
                      {orderStatusIcons.find((icon) => icon.status === status)
                        ?.icon || "❓"}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  )}
                  <div className="absolute -bottom-5 right-0 text-[10px] flex items-center gap-1 text-muted-foreground w-max">
                    <span
                      className={`${
                        orderStatusIcons.find((icon) => icon.status === status)
                          ?.color || ""
                      } w-1 h-1 rounded-full block`}
                    ></span>
                    {orderStatusIcons.find((icon) => icon.status === status)
                      ?.message || ""}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-xs mt-0.5">
                Order #{orderDetails._id}
              </p>

              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">Payment Method</p>
                <Badge variant={"default"} className="text-xs">
                  {orderDetails.paymentMethod === "online" ? "Online" : "Cash"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">Payment Status</p>
                <Badge
                  variant={orderDetails.isPaid ? "success" : "destructive"}
                  className="text-xs"
                >
                  {orderDetails.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              <div className="text-right text-xs text-muted-foreground flex items-center justify-between pb-1">
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

              <div className="text-sm space-y-1">
                <ScrollArea className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="border-t">
                      <TableRow>
                        <TableHead className="text-left">Items</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-center">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.orderedFoodItems.map((item, index) => (
                        <TableRow
                          key={item.foodItemId + index}
                          className="text-primary/80"
                        >
                          <TableCell className="font-medium flex items-center gap-2 text-left whitespace-pre-wrap">
                            <Tooltip>
                              <TooltipTrigger>
                                <div
                                  className={`border ${item.foodType === "veg" ? "border-green-500" : ""} ${item.foodType === "non-veg" ? "border-red-500" : ""} outline outline-white bg-white p-0.5 cursor-help`}
                                >
                                  <span
                                    className={`${item.foodType === "veg" ? "bg-green-500" : ""} ${item.foodType === "non-veg" ? "bg-red-500" : ""} w-1.5 h-1.5 block rounded-full`}
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

                            {item.firstImageUrl ? (
                              <Avatar>
                                <AvatarImage
                                  src={item.firstImageUrl}
                                  alt={item.foodName}
                                  className="w-8 h-8 object-cover rounded-md"
                                  draggable={false}
                                />
                                <AvatarFallback className="rounded-md">
                                  <IconSalad />
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="rounded-md">
                                  <IconSalad />
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <span>
                              {item.isVariantOrder
                                ? item.variantDetails?.variantName
                                : item.foodName}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-center relative">
                            {item.price !== item.finalPrice && (
                              <span className="absolute bottom-0 right-0 text-xs line-through">
                                {item.price.toFixed(2)}
                              </span>
                            )}
                            ₹{item.finalPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{(item.finalPrice * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="text-right">
                          Total Qty :
                        </TableCell>
                        <TableCell className="text-center">
                          {orderDetails.orderedFoodItems.reduce(
                            (prv, item) => prv + item.quantity,
                            0
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          Sub Total :
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{orderDetails.subtotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-muted">
                        <TableCell colSpan={3} className="text-right">
                          Total Discount :
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{orderDetails.discountAmount?.toFixed(2) || "0.00"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right">
                          Total Tax :
                          {orderDetails.restaurant?.isTaxIncludedInPrice && (
                            <p className="text-xs text-muted-foreground font-normal">
                              (Included in price)
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{orderDetails.taxAmount?.toFixed(2) || "0.00"}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-muted">
                        <TableCell colSpan={3} className="text-right">
                          Total Amount :
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{orderDetails.totalAmount?.toFixed(2) || "0.00"}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Order Note</h3>
                <p
                  className={`bg-muted px-3 py-1 rounded-md ${!orderDetails.notes ? "text-xs text-muted-foreground" : "text-sm"}`}
                >
                  {orderDetails.notes ?? "No special instructions provided"}
                </p>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                {orderDetails.customerName && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Customer Info</h3>
                    <div className="bg-muted rounded-md p-3 space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Name: </span>
                        {orderDetails.customerName || "Not provided"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Phone: </span>
                        {orderDetails.customerPhone || "Not provided"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {orderDetails.deliveryAddress && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      Delivery Address
                    </h3>
                    <div className="bg-muted rounded-md p-3 text-sm">
                      {orderDetails.deliveryAddress || "No delivery address"}
                    </div>
                  </div>
                )}

                {/* Platform Info */}
                {orderDetails.externalPlatform && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Platform Info</h3>
                    <div className="bg-muted rounded-md p-3 text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">
                          Platform:{" "}
                        </span>
                        {orderDetails.externalPlatform || "N/A"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          External Order ID:{" "}
                        </span>
                        {orderDetails.externalOrderId || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Attempts */}
                <div>
                  <h3 className="text-sm font-medium mb-1">Payment Attempts</h3>
                  <div
                    className={`bg-muted px-3 py-1 rounded-md ${orderDetails.paymentAttempts.length === 0 ? "text-xs text-muted-foreground" : "text-sm"}`}
                  >
                    {orderDetails.paymentAttempts.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {orderDetails.paymentAttempts.map((attempt, index) => (
                          <li key={index}>
                            {JSON.stringify(attempt)}{" "}
                            {/* You can format if structure is known */}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No payment attempts recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-500 text-center">
              No order details found. Please try again later
            </div>
          )}
          <DialogFooter className="p-4 flex justify-between! items-center w-full flex-row">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetails;
