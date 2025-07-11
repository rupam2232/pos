import type {
  Order,
  OrderDetails as OrderDetailsType,
} from "@repo/ui/types/Order";
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
import { BellRing, BookCheck, CheckCheck, Soup, Timer } from "lucide-react";
import { IconReceiptOff } from "@tabler/icons-react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import OrderDetails from "@/components/order-details";
import { Label } from "@repo/ui/components/label";

const orderCard = ({
  order,
  restaurantSlug,
  setOrders,
}: {
  order: Order;
  restaurantSlug: string;
  setOrders: React.Dispatch<React.SetStateAction<OrderDetailsType>>;
}) => {
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
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Table: {order.table.tableName}</span>
          <div className="relative">
            <Badge
              variant="default"
              className={`${
                orderStatusIcons.find((icon) => icon.status === order.status)
                  ?.color || ""
              }`}
            >
              {orderStatusIcons.find((icon) => icon.status === order.status)
                ?.icon || "❓"}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <div className="absolute -bottom-5 right-0 text-[10px] flex items-center gap-1 text-muted-foreground">
              <span
                className={`${
                  orderStatusIcons.find((icon) => icon.status === order.status)
                    ?.color || ""
                } w-1 h-1 rounded-full block`}
              ></span>
              {orderStatusIcons.find((icon) => icon.status === order.status)
                ?.message || ""}
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-xs mt-0.5">
          Order #{order._id}
        </p>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Payment Status</Label>
          <Badge
            variant={order.isPaid ? "success" : "destructive"}
            className="text-xs"
          >
            {order.isPaid ? "Paid" : "Unpaid"}
          </Badge>
        </div>

        <div className="text-right text-xs text-muted-foreground flex items-center justify-between">
          <p>
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "long",
              day: "2-digit",
            })}
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

        <div className="pt-2 text-sm space-y-1">
          <Table>
            <TableHeader className="border-t">
              <TableRow>
                <TableHead className="text-left">Items</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderedFoodItems.map((item, index) => (
                <TableRow
                  key={item.foodItemId + index}
                  className="text-primary/80"
                >
                  <TableCell className="font-medium flex items-center gap-2 text-left whitespace-pre-wrap">
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
                    <span>
                      {item.isVariantOrder ? item.variantName : item.foodName}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
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
                  {order.orderedFoodItems.reduce(
                    (prv, item) => prv + item.quantity,
                    0
                  )}
                </TableCell>
                <TableCell className="text-right">
                  ₹{order.totalAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        <div className="flex gap-2 pt-3 justify-between">
          <OrderDetails
            order={order}
            setOrders={setOrders}
            restaurantSlug={restaurantSlug}
          >
            <Button variant="outline">See Details</Button>
          </OrderDetails>
          <Button>Pay Bills</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default orderCard;
