"use client";
import { Loader2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import axios from "@/utils/axiosInstance";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import type { CurrentSubscription } from "@repo/ui/types/Subscription";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { RootState } from "@/store/store";
import loadRazorpayScript from "@/utils/loadRazorpayScript";

const ClientPage = () => {
  const [currentSubscription, setCurrentSubscription] =
    useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const cardData = [
    {
      plan: "starter",
      title: "Starter Plan",
      description: "Plan suitable for individuals and small teams",
      price: 300,
      features: ["Feature 1", "Feature 2", "Feature 3"],
    },
    {
      plan: "medium",
      title: "Medium Plan",
      description: "Plan suitable for small to medium-sized teams",
      price: 500,
      features: ["Feature 1", "Feature 2", "Feature 3"],
    },
    {
      plan: "pro",
      title: "Pro Plan",
      description: "Plan suitable for large teams and enterprises",
      price: 800,
      features: ["Feature 1", "Feature 2", "Feature 3"],
    },
  ];

  const fetchSubscriptionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/subscription");
      setCurrentSubscription(response.data.data);
    } catch (error) {
      console.error(
        "Failed to fetch subscription details. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch subscription details. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin?redirect=/billing");
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, router]);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [fetchSubscriptionDetails]);

  const onSubscribe = async (
    e: React.MouseEvent<HTMLButtonElement>,
    plan: string,
    card: { title: string; plan: string; description: string; price: number }
  ) => {
    e.preventDefault();
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load");
        return;
      }
      setCardLoading(true);
      const response = await axios.post("/subscription/create", { plan });
      if (!response.data.data || !response.data.data.id) {
        toast.error("Invalid response from server");
        return;
      }
      const data = response.data.data;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: `${process.env.NEXT_PUBLIC_APP_NAME} ${card.title}`,
        description: card.description,
        image: process.env.NEXT_PUBLIC_CLIENT_BASE_URL + "/favicon.ico",
        order_id: data.id,
        handler: async function (response: unknown) {
          if (
            !response ||
            typeof response !== "object" ||
            !("razorpay_payment_id" in response) ||
            !("razorpay_signature" in response)
          ) {
            toast.error("Invalid response from Razorpay");
            return;
          }
          try {
            const verifyResponse = await axios.post(
              "/payment/razorpay/verify",
              {
                paymentId: response.razorpay_payment_id,
                orderId: data.id,
                signature: response.razorpay_signature,
              }
            );
            if (verifyResponse.data.success) {
              toast.success(
                verifyResponse.data.message || "Payment Successful"
              );
              router.refresh();
            } else {
              toast.error(
                verifyResponse.data.message || "Payment Verification Failed"
              );
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(
              axiosError.response?.data.message ||
                "Payment verification failed. Please try again later."
            );
          }
        },
        notes: {
          paymentType: data.notes.paymentType ?? "subscription",
          period: data.notes.period ?? "monthly",
          userId: data.notes.userId ?? user?._id,
          email: data.notes.email ?? user?.email,
          amount: data.notes.amount ?? card.price,
          plan: data.notes.plan ?? plan,
          receipt: data.receipt,
        },
        theme: {
          color: "#2563eb",
        },
        prefill: {
          email: user?.email || "",
          contact: "+919977665544", // Dummy contact number, as Razorpay requires it
          name: user?.firstName + " " + user?.lastName || "",
        },
        readonly: { email: true },
        hidden: { contact: true },
        modal: {
          backdropclose: true,
          confirm_close: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", function () {
        toast.error("Payment Failed");
      });
    } catch (error) {
      console.error("Subscription failed. Please try again later:", error);
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message ||
            "Subscription failed. Please try again later"
        );
        if (axiosError.response?.status === 401) {
          dispatch(signOut());
          router.push("/signin?redirect=/billing");
        }
      } else if (error instanceof Error) {
        toast.error(
          error.message || "Subscription failed. Please try again later"
        );
      } else {
        toast.error("Subscription failed. Please try again later");
      }
    } finally {
      setCardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(95svh-var(--header-height))]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Current Plan</h1>
        <p className="mb-4">
          {currentSubscription?.plan
            ? `You are currently subscribed to the ${currentSubscription.plan} plan.`
            : "You are not subscribed to any plan."}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {cardData.map((card) => (
          <Card key={card.title} className="gap-2 w-full">
            <CardHeader>
              <CardTitle className="text-3xl">
                {card.plan.charAt(0).toUpperCase() + card.plan.slice(1)}
              </CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-semibold">
                ₹{card.price} INR/month{" "}
                <span className="text-sm font-normal">(inclusive of GST)</span>
              </p>
              <CardAction className="w-full">
                <Button
                  className="w-full"
                  onClick={(e) => onSubscribe(e, card.plan, card)}
                  disabled={cardLoading}
                >
                  {cardLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    `Get ${card.plan.charAt(0).toUpperCase() + card.plan.slice(1)}`
                  )}
                </Button>
              </CardAction>

              <div>
                <ul className="list-disc list-inside space-y-2">
                  {card.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* <Card className="gap-2 w-full md:w-1/3">
          <CardHeader>
            <CardTitle className="text-3xl">Medium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold">
              ₹500 INR/month{" "}
              <span className="text-sm font-normal">(inclusive of GST)</span>
            </p>
            <CardAction className="w-full">
              <Button className="w-full">Get Medium</Button>
            </CardAction>

            <div>
              <ul className="list-disc list-inside space-y-2">
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card className="gap-2 w-full md:w-1/3">
          <CardHeader>
            <CardTitle className="text-3xl">Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold">
              ₹800 INR/month{" "}
              <span className="text-sm font-normal">(inclusive of GST)</span>
            </p>
            <CardAction className="w-full">
              <Button className="w-full">Get Pro</Button>
            </CardAction>

            <div>
              <ul className="list-disc list-inside space-y-2">
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
              </ul>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default ClientPage;
