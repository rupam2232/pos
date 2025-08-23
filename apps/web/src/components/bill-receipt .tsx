"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@repo/ui/components/button";
import type { FullOrderDetailsType } from "@repo/ui/types/Order";
import axios from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { ApiResponse } from "@repo/ui/types/ApiResponse";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QRCodeStyling from "qr-code-styling";
import { Loader2 } from "lucide-react";

const BillReceipt = ({
  orderId,
  restaurantSlug,
}: {
  orderId: string;
  restaurantSlug: string;
}) => {
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const qrDivRef = useRef<HTMLDivElement | null>(null);
  const [orderDetails, setOrderDetails] = useState<FullOrderDetailsType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const handlePrint = () => {
    window.print();
    // window.open(window.location.href, "PRINT", "height=600,width=800");
  };

  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/order/${restaurantSlug}/${orderId}`);
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
  }, [restaurantSlug, orderId, dispatch, router]);

  useEffect(() => {
    fetchOrderDetails();
    setQrCode(new QRCodeStyling({
      width: 1200,
      height: 1200,
      data: window.location.href,
      type: "svg",
      margin: 40,
      dotsOptions: {
        color: "#000000",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 20,
      },
      qrOptions: {
        errorCorrectionLevel: "H", // High error correction for logo overlay
      },
    }));
  }, [fetchOrderDetails]);

  useEffect(() => {
    if (qrCode) {
      setTimeout(() => {
        qrCode.append(qrDivRef.current!);
      }, 500);
    }
  }, [qrCode, qrDivRef]);


  if (isLoading) {
    return <div className="h-screen flex items-center justify-center gap-x-2"><Loader2 className="animate-spin size-4" />Loading...</div>;
  }

  if (error) {
    return <div className="h-screen flex items-center justify-center gap-x-2">Error: {error}</div>;
  }

  if (!orderDetails) {
    return <div className="h-screen flex items-center justify-center gap-x-2">No order details found</div>;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Printable area */}
      <div
        id="print-area"
        className="w-[80mm] bg-white text-black p-2 font-mono text-sm"
      >
        {/* Header */}
        <div className="text-center border-b border-dashed pb-2 mb-2">
          <h2 className="font-bold text-lg">
            {orderDetails.restaurant.restaurantName}
          </h2>
          {orderDetails.restaurant.address && (
            <p>{orderDetails.restaurant.address}</p>
          )}
          {/* <p>GSTIN: 29ABCDE1234F1Z5</p> */}
        </div>

        {/* Bill Info */}
        <div className="flex justify-between text-xs mb-2 flex-wrap gap-2">
          <span>Order: #{orderDetails.orderNo}</span>
          <span>
            {new Date(orderDetails.createdAt).getDate()}{" "}
            {new Date(orderDetails.createdAt).toLocaleString("default", {
              month: "short",
            })}{" "}
            {new Date(orderDetails.createdAt).getFullYear()} -{" "}
            {new Date(orderDetails.createdAt)
              .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .toUpperCase()}
          </span>
        </div>
        <div className="text-xs mb-2">
          {/* <span>Table: 12</span> */}
          {orderDetails.kitchenStaff?.firstName && (
            <span>Staff: {orderDetails.kitchenStaff?.firstName}</span>
          )}
        </div>

        {/* Items */}
        <table className="w-full text-xs mb-2">
          <thead className="border-b border-dashed">
            <tr className="text-left">
              <th className="w-1/2">Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.orderedFoodItems.map((item) => (
              <tr key={item.foodItemId}>
                <td>
                  {item.foodName}{" "}
                  {item.variantDetails &&
                    `(${item.variantDetails.variantName})`}
                </td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{item.finalPrice}</td>
                <td className="text-right">
                  {item.finalPrice * item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-dashed pt-2 text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{orderDetails.subtotal.toFixed(2)}</span>
          </div>

          {orderDetails.taxAmount ? (
            <div className="flex justify-between">
              <span>
                {orderDetails.restaurant.taxLabel} (
                {orderDetails.restaurant.taxRate}%)
              </span>
              <span>{orderDetails.taxAmount.toFixed(2)}</span>
            </div>
          ) : (
            <></>
          )}

          {orderDetails.discountAmount &&
            orderDetails.discountAmount ===
              orderDetails.orderedFoodItems.reduce(
                (acc, item) => acc + (item.finalPrice - item.price),
                0
              ) ? (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{orderDetails.discountAmount.toFixed(2)}</span>
              </div>
            ) : <></>}

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{orderDetails.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs border-t border-dashed pt-2">
          <p>Thank you for dining with us!</p>
          <p>Visit Again</p>
        </div>
        <div className="text-center mt-4 text-xs">
          <div className="[&_svg]:size-28! flex justify-center" ref={qrDivRef} />
          <p>Scan this QR code to view your bill anytime</p>
        </div>
      </div>

      {/* Print Button (won't be printed) */}
      <Button onClick={handlePrint} className="mt-4 print:hidden">
        Print Bill
      </Button>
    </div>
  );
};

export default BillReceipt;
