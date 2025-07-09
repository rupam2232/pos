import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
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
    if(order._id !== orderDetails?._id){
      fetchOrderDetails();
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild onClick={()=> onChildBtnClick()}>{children}</SheetTrigger>
      <SheetContent className="overflow-auto">
        <ScrollArea className="h-full">
          <SheetHeader>
            <SheetTitle>
              Order Details for {order.table.tableName} - {order._id}
            </SheetTitle>
            <SheetDescription>
              View and manage the details of this order, including food items,
              status, and payment information.
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <div className="space-y-4 p-4">
              <div>
                <Label>Restaurant Name</Label>
                <Input
                  value={orderDetails?.restaurant.restaurantName || ""}
                  readOnly
                />
              </div>
              <div>
                <Label>Order Status</Label>
                <Input value={order.status} readOnly />
              </div>
              <div>
                <Label>Total Amount</Label>
                <Input value={`₹${order.totalAmount.toFixed(2)}`} readOnly />
              </div>
              <div>
                <Label>Payment Status</Label>
                <Input value={order.isPaid ? "Paid" : "Pending"} readOnly />
              </div>
              {orderDetails?.orderedFoodItems.map((item, index) => (
                <div key={index} className="border p-2 rounded">
                  <h3 className="font-semibold">{item.foodName}</h3>
                  {item.variantDetails && (
                    <p>Variant: {item.variantDetails.variantName}</p>
                  )}
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ₹{item.finalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
          <SheetFooter>
            <Button type="submit">Save changes</Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default OrderDetails;
