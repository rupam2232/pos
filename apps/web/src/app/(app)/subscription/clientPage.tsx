"use client";
import { Loader2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import axios from "@/utils/axiosInstance";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";

const ClientPage = () => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

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
        router.push("/signin?redirect=/subscription");
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, router]);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [fetchSubscriptionDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(95svh-var(--header-height))]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
        <Card className="gap-2 w-full md:w-1/3">
          <CardHeader>
            <CardTitle className="text-3xl">Starter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold">
              ₹300 INR/month{" "}
              <span className="text-sm font-normal">(inclusive of GST)</span>
            </p>
            <CardAction className="w-full">
              <Button className="w-full">Get Starter</Button>
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
        </Card>
      </div>
    </div>
  );
};

export default ClientPage;
