"use client";
import axios from "@/utils/axiosInstance";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import {
  Card,
//   CardAction,
  CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { CheckCircle, Timer, Wallet, BellRing } from "lucide-react";

const Page = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  // const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [incompleteOrders, setIncompleteOrders] = useState<number>(0);
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchIncompleteOrderQuantity = useCallback(async () => {
    try {
      const response = await axios.get(`/order/${slug}?limit=1&page=1&status=pending`);
      if (typeof(response.data.data.totalOrders) === "number") {
        setIncompleteOrders(response.data.data.totalOrders);
      } else {
        setIncompleteOrders(0);
        toast.error("No incomplete orders found");
      }
    } catch (error) {
      console.error(
        "Failed to fetch incomplete orders. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch incomplete orders. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
      setIncompleteOrders(0);
    }
  }, [slug, router, dispatch]);

  useEffect(() => {
    fetchIncompleteOrderQuantity();
  }, [slug, fetchIncompleteOrderQuantity]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            <Card className="bg-emerald-800 text-white">
              <CardContent className="grid grid-rows-2 gap-4">
                <p className="text-sm mb-1 col-start-1">New Orders</p>
                <div className="row-span-2 col-span-1 flex items-center justify-end w-full">
                  <span className="p-3 bg-emerald-200 rounded-md">
                    <BellRing className="size-5 text-emerald-800" />
                  </span>
                </div>
                <div className="flex items-center justify-between col-span-1">
                  <span className="text-2xl font-bold">{incompleteOrders}</span>
                </div>
                <p className="text-xs col-span-2">* Updated every new Order</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-800 text-white">
              <CardContent className="grid grid-rows-2 gap-4">
                <p className="text-sm mb-1 col-start-1">Total Orders</p>
                <div className="row-span-2 col-span-1 flex items-center justify-end w-full">
                  <span className="p-3 bg-blue-100 rounded-md">
                    <CheckCircle className="size-5 text-blue-800" />
                  </span>
                </div>
                <div className="flex items-center justify-between col-span-1">
                  <span className="text-2xl font-bold">86</span>
                </div>
                <p className="text-xs col-span-2 text-green-400">+2.5% than usual</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-800 text-white">
              <CardContent className="grid grid-rows-2 gap-4">
                <p className="text-sm mb-1 col-start-1">Waiting List</p>
                <div className="row-span-2 col-span-1 flex items-center justify-end w-full">
                  <span className="p-3 bg-orange-200 rounded-md">
                    <Timer className="size-5 text-orange-800" />
                  </span>
                </div>
                <div className="flex items-center justify-between col-span-1">
                  <span className="text-2xl font-bold">9</span>
                </div>
                <p className="text-xs col-span-2 text-green-400">+3.2% than usual</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Order List</h3>
                <Input placeholder="Search a Order" className="mb-4" />
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center">
                    <span>A4 Ariel Hikmat (5 items)</span>
                    <span className="text-green-600 text-xs">Ready</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>B2 Denis Freeman (4 items)</span>
                    <span className="text-yellow-500 text-xs">Cooking Now</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>TA Morgan Cox (6 items)</span>
                    <span className="text-yellow-500 text-xs">In Progress</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>TA Paul Rey (5 items)</span>
                    <span className="text-yellow-500 text-xs">In Progress</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>A9 Maja Becker</span>
                    <span className="text-muted-foreground text-xs">
                      Completed
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>C2 Erwan Richard</span>
                    <span className="text-muted-foreground text-xs">
                      Completed
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Payment</h3>
                <Input placeholder="Search a Order" className="mb-4" />
                <ul className="space-y-2 text-sm">
                  {[
                    "A9 Maja Becker",
                    "C2 Erwan Richard",
                    "A2 Stefan Meijer",
                    "A3 Julie Madsen",
                    "B4 Aulia Julie",
                    "B7 Emma Fortin",
                    "TA Mason Groves",
                  ].map((name, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>{name}</span>
                      <Button variant="outline" className="text-xs">
                        <Wallet size={14} className="mr-1" /> Pay Now
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
