"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { Input } from "@repo/ui/components/input";
import { ScrollArea, ScrollBar } from "@repo/ui/components/scroll-area";
import { Card, CardFooter } from "@repo/ui/components/card";
import { Search, X } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { useSocket } from "@/context/SocketContext";

const Page = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tabName, setTabName] = useState<string>("all");
  const [allOrders, setAllOrders] = useState<OrderDetailsType>(null);
  const [tabPages, setTabPages] = useState<{ [key: string]: number }>({
    all: 1,
  });
  const [isPageChanging, setIsPageChanging] = useState<boolean>(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const observer = useRef<IntersectionObserver>(null);
  const currentPage = tabPages[tabName] || 1;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const debounced = useDebounceCallback(setSearchInput, 300);
    const socket = useSocket();

  const fetchOrders = useCallback(async () => {
    if (!slug) {
      toast.error("Restaurant slug is required to fetch orders");
      return;
    }

    if (tabName === "search" && searchInput.trim() === "") return;
    
    try {
      let query = "";
      switch (tabName) {
        case "all":
          query = "";
          break;
        case "new":
          query = "status=pending";
          break;
        case "inProgress":
          query = "status=preparing";
          break;
        case "ready":
          query = "status=ready";
          break;
        case "unPaid":
          query = "isPaid=false";
          break;
        case "completed":
          query = "status=completed&status=cancelled";
          break;
        case "search":
          query = `search=${searchInput}`;
          break;

        default:
          query = "";
          break;
      }
      if (currentPage === 1) {
        setIsLoading(true);
        const response = await axios.get(`/order/${slug}?${query}`);
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data.orders)
        ) {
          setAllOrders(response.data.data);
        } else {
          setAllOrders({
            orders: [],
            totalOrders: 0,
            page: 1,
            limit: 1,
            totalPages: 1,
          });
          toast.error("Failed to fetch orders. Please try again later");
        }
      } else {
        setIsPageChanging(true);
        const response = await axios.get(
          `/order/${slug}?page=${currentPage}&${query}`
        );
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data.orders)
        ) {
          setAllOrders((prevOrders) => ({
            ...response.data.data,
            orders: [
              ...(prevOrders?.orders || []),
              ...response.data.data.orders,
            ],
          }));
        } else {
          setAllOrders({
            orders: [],
            totalOrders: 0,
            page: 1,
            limit: 1,
            totalPages: 1,
          });
          toast.error("Failed to fetch orders. Please try again later");
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders. Please try again later:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch orders. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setIsPageChanging(false);
      setIsLoading(false);
    }
  }, [slug, router, dispatch, currentPage, tabName, searchInput]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries && Array.isArray(entries) && entries[0]?.isIntersecting) {
          if (
            allOrders &&
            allOrders?.totalPages > currentPage &&
            allOrders.page === currentPage
          ) {
            if (isPageChanging) return;
            setTabPages((prev) => ({
              ...prev,
              [tabName]: (prev[tabName] || 1) + 1,
            }));
          }
        }
      });
      if (node) observer.current.observe(node);
    },
    [allOrders, currentPage, tabName, isPageChanging]
  );

  useEffect(() => {
    socket?.on("newOrder", (data) => {
      console.log("New order received:", data);
      fetchOrders();
    });

    return () => {
      socket?.off("newOrder");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);


  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setIsLoading(true);
    setAllOrders(null);
    setTabPages((prev) => ({
      ...prev,
      [tabName]: 1,
    }));
  }, [tabName]);

  return (
    <div className="flex flex-1 flex-col p-4 md:gap-6 lg:p-6">
      <Tabs defaultValue="all" value={tabName} onValueChange={setTabName}>
        <ScrollArea className="w-full pb-3">
          <div className="flex items-center justify-between">
            <TabsList>
              {[
                {
                  tab: "all",
                  label: "All",
                },
                {
                  tab: "new",
                  label: "New",
                },
                {
                  tab: "inProgress",
                  label: "In Progress",
                },
                {
                  tab: "ready",
                  label: "Ready",
                },
                {
                  tab: "unPaid",
                  label: "Unpaid",
                },
                {
                  tab: "completed",
                  label: "Completed",
                },
              ].map(({ tab, label }) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="font-medium data-[state=active]:font-semibold data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200"
                  onClick={() => setTabName(tab)}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex items-center mr-1">
              <div
                className="flex items-center gap-2 *:flex flex-wrap pl-2 py-1 rounded-lg overflow-hidden border-zinc-400 cursor-text focus-within:ring-1 border focus-within:border-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 bg-transparent"
                onClick={() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
              >
                <Search className="size-4 shrink-0 opacity-50" />
                <Input
                  className="w-60 placeholder:text-muted-foreground placeholder:truncate flex rounded-md bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 outline-0 border-none h-6 min-w-fit flex-1 focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 px-1 shadow-none dark:bg-transparent"
                  placeholder="Search orders by ID, table name, food item name..."
                  type="search"
                  onChange={(e) => {
                    debounced(e.target.value);
                    if (e.target.value.trim() === "") {
                      setTabName("all");
                      setSearchInput("");
                    } else {
                      setTabName("search");
                    }
                  }}
                  ref={searchInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (searchInput.trim() === "") {
                        toast.error("Search input cannot be empty");
                        return;
                      }
                      setTabName("search");
                      fetchOrders();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (searchInputRef.current) {
                      searchInputRef.current.value = "";
                      setSearchInput("");
                      setTabName("all");
                    }
                  }}
                  className={cn(
                    "hover:opacity-100 hover:bg-accent h-6 w-6",
                    searchInputRef.current &&
                      searchInputRef.current.value !== ""
                      ? ""
                      : "invisible"
                  )}
                >
                  <X />
                </Button>
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value={tabName}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
              {Array.from({ length: 3 }).map((_, index) => (
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
              ))}
            </div>
          ) : allOrders &&
            Array.isArray(allOrders.orders) &&
            allOrders.orders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
              {allOrders.orders.map((order, index) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  ref={
                    index === allOrders.orders.length - 1
                      ? lastElementRef
                      : null
                  }
                  restaurantSlug={slug}
                />
              ))}
              {isPageChanging &&
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
                ))}
            </div>
          ) : (
            <Card className="@container/card mt-4">
              <CardFooter className="flex-col gap-4 text-sm flex justify-center">
                <div className="line-clamp-1 flex gap-2 font-medium text-center text-balance">
                  No orders found
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
