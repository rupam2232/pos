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
import axios from "@/utils/axiosInstance";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { ApiResponse } from "@repo/ui/types/ApiResponse";
import type { OrderDetails as OrderDetailsType } from "@repo/ui/types/Order";
import OrderCard from "@/components/order-card";

const Page = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tabName, setTabName] = useState<string>("all");
  const [allOrders, setAllOrders] = useState<OrderDetailsType>(null);
  const [newOrders, setNewOrders] = useState<OrderDetailsType>(null);
  const [inProgressOrders, setInProgressOrders] =
    useState<OrderDetailsType>(null);
  const [readyOrders, setReadyOrders] = useState<OrderDetailsType>(null);
  const [unpaidOrders, setUnpaidOrders] = useState<OrderDetailsType>(null);
  const [completedOrders, setCompletedOrders] =
    useState<OrderDetailsType>(null);
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

  const fetchNewOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/order/${slug}?status=pending`);
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.orders)
      ) {
        setNewOrders(response.data.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch new orders. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch new orders. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, router, dispatch]);

  const fetchInProgressOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/order/${slug}?status=preparing`);
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.orders)
      ) {
        setInProgressOrders(response.data.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch in progress orders. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch in progress orders. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, router, dispatch]);

  const fetchReadyOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/order/${slug}?status=ready`);
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.orders)
      ) {
        setReadyOrders(response.data.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch ready orders. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch ready orders. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, router, dispatch]);

  const fetchUnpaidOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/order/${slug}`);
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.orders)
      ) {
        setUnpaidOrders(response.data.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch un paid orders. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch un paid orders. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, router, dispatch]);

  const fetchCompletedOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/order/${slug}`);
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.orders)
      ) {
        setCompletedOrders(response.data.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch completed orders. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch completed orders. Please try again later"
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
        fetchNewOrders();
        break;
      case "inProgress":
        fetchInProgressOrders();
        break;
      case "ready":
        fetchReadyOrders();
        break;
      case "unPaid":
        fetchUnpaidOrders();
        break;
      case "completed":
        fetchCompletedOrders();
        break;

      default:
        break;
    }
  }, [
    tabName,
    slug,
    fetchAllOrders,
    fetchNewOrders,
    fetchInProgressOrders,
    fetchReadyOrders,
    fetchUnpaidOrders,
    fetchCompletedOrders,
  ]);

  return (
    <div className="flex flex-1 flex-col p-4 md:gap-6 lg:p-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`animate-pulse ${index > 0 ? `delay-${(index + 1) * 100}` : ""} h-80 border border-accent shadow-md rounded-md flex flex-col justify-between p-4`}
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="animate-pulse bg-accent h-6 w-full rounded-md"></div>
                    <div className="animate-pulse bg-accent h-4 w-4/5 rounded-md"></div>
                  </div>
                  <div className="animate-pulse bg-accent h-15 w-full rounded-md"></div>
                  <div className="animate-pulse bg-accent h-8 w-1/3 rounded-md"></div>
                </div>
              ))
            ) : !Array.isArray(allOrders?.orders) ||
              allOrders.orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              allOrders.orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  setOrders={setAllOrders}
                  restaurantSlug={slug}
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="new">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`animate-pulse ${index > 0 ? `delay-${(index + 1) * 100}` : ""} h-80 border border-accent shadow-md rounded-md flex flex-col justify-between p-4`}
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="animate-pulse bg-accent h-6 w-full rounded-md"></div>
                    <div className="animate-pulse bg-accent h-4 w-4/5 rounded-md"></div>
                  </div>
                  <div className="animate-pulse bg-accent h-15 w-full rounded-md"></div>
                  <div className="animate-pulse bg-accent h-8 w-1/3 rounded-md"></div>
                </div>
              ))
            ) : !Array.isArray(newOrders?.orders) ||
              newOrders.orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              newOrders.orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  setOrders={setNewOrders}
                  restaurantSlug={slug}
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="inProgress">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`animate-pulse ${index > 0 ? `delay-${(index + 1) * 100}` : ""} h-80 border border-accent shadow-md rounded-md flex flex-col justify-between p-4`}
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="animate-pulse bg-accent h-6 w-full rounded-md"></div>
                    <div className="animate-pulse bg-accent h-4 w-4/5 rounded-md"></div>
                  </div>
                  <div className="animate-pulse bg-accent h-15 w-full rounded-md"></div>
                  <div className="animate-pulse bg-accent h-8 w-1/3 rounded-md"></div>
                </div>
              ))
            ) : !Array.isArray(inProgressOrders?.orders) ||
              inProgressOrders.orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              inProgressOrders.orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  setOrders={setInProgressOrders}
                  restaurantSlug={slug}
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="ready">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`animate-pulse ${index > 0 ? `delay-${(index + 1) * 100}` : ""} h-80 border border-accent shadow-md rounded-md flex flex-col justify-between p-4`}
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="animate-pulse bg-accent h-6 w-full rounded-md"></div>
                    <div className="animate-pulse bg-accent h-4 w-4/5 rounded-md"></div>
                  </div>
                  <div className="animate-pulse bg-accent h-15 w-full rounded-md"></div>
                  <div className="animate-pulse bg-accent h-8 w-1/3 rounded-md"></div>
                </div>
              ))
            ) : !Array.isArray(readyOrders?.orders) ||
              readyOrders.orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              readyOrders.orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  setOrders={setReadyOrders}
                  restaurantSlug={slug}
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="unPaid">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`animate-pulse ${index > 0 ? `delay-${(index + 1) * 100}` : ""} h-80 border border-accent shadow-md rounded-md flex flex-col justify-between p-4`}
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="animate-pulse bg-accent h-6 w-full rounded-md"></div>
                    <div className="animate-pulse bg-accent h-4 w-4/5 rounded-md"></div>
                  </div>
                  <div className="animate-pulse bg-accent h-15 w-full rounded-md"></div>
                  <div className="animate-pulse bg-accent h-8 w-1/3 rounded-md"></div>
                </div>
              ))
            ) : !Array.isArray(unpaidOrders?.orders) ||
              unpaidOrders.orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              unpaidOrders.orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  setOrders={setUnpaidOrders}
                  restaurantSlug={slug}
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`animate-pulse ${index > 0 ? `delay-${(index + 1) * 100}` : ""} h-80 border border-accent shadow-md rounded-md flex flex-col justify-between p-4`}
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="animate-pulse bg-accent h-6 w-full rounded-md"></div>
                    <div className="animate-pulse bg-accent h-4 w-4/5 rounded-md"></div>
                  </div>
                  <div className="animate-pulse bg-accent h-15 w-full rounded-md"></div>
                  <div className="animate-pulse bg-accent h-8 w-1/3 rounded-md"></div>
                </div>
              ))
            ) : !Array.isArray(completedOrders?.orders) ||
              completedOrders.orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              completedOrders.orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  setOrders={setCompletedOrders}
                  restaurantSlug={slug}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
