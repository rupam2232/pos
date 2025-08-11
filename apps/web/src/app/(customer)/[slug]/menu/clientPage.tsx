"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AllFoodItems, FoodItem } from "@repo/ui/types/FoodItem";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import { Card, CardContent, CardFooter } from "@repo/ui/components/card";
import Image from "next/image";
import { cn } from "@repo/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { IconSalad } from "@tabler/icons-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { ScrollArea, ScrollBar } from "@repo/ui/components/scroll-area";
import { Input } from "@repo/ui/components/input";
import { Loader2, Minus, Plus, Search, X } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";
import { Button } from "@repo/ui/components/button";
import CustomerFoodDetails from "@/components/customer-food-details";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { Table } from "@repo/ui/types/Table";

const MenuClientPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [allFoodItems, setAllFoodItems] = useState<AllFoodItems | null>(null);
  const [restaurantCategories, setRestaurantCategories] = useState<string[]>(
    []
  );
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isPageChanging, setIsPageChanging] = useState<boolean>(false);
  const [tabName, setTabName] = useState<string>("all");
  const [tabPages, setTabPages] = useState<{ [key: string]: number }>({
    all: 1,
  });
  const [searchInput, setSearchInput] = useState<string>("");
  const [showEditDrawer, setShowEditDrawer] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(
    null
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver>(null);
  const debounced = useDebounceCallback(setSearchInput, 300);
  const currentPage = tabPages[tabName] || 1;
  const { cartItems, syncCart, addItem, removeItem, editItem } = useCart(slug);
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");
  const [isTableDataLoading, setIsTableDataLoading] = useState<boolean>(true);
  const [tableDetails, setTableDetails] = useState<Table | null>(null);

  const fetchFoodItems = useCallback(async () => {
    if (!slug) {
      toast.error("Restaurant slug is required to fetch food items");
      return;
    }
    if (tabName === "search" && searchInput.trim() === "") return;

    try {
      if (currentPage === 1) {
        setIsPageLoading(true);
        const response = await axios.get(
          `/food-item/${slug}?${tabName !== "search" ? `tab=${tabName}` : ""}${
            searchInput.trim() ? `search=${searchInput.trim()}` : ""
          }`
        );
        setAllFoodItems({ ...response.data.data });
      } else {
        setIsPageChanging(true);
        const response = await axios.get(
          `/food-item/${slug}?page=${currentPage}&tab=${tabName}${
            searchInput.trim() ? `&search=${searchInput.trim()}` : ""
          }`
        );
        setAllFoodItems((prev) => ({
          ...response.data.data,
          foodItems: [
            ...(prev?.foodItems || []),
            ...response.data.data.foodItems,
          ],
        }));
      }
    } catch (error) {
      console.error(
        "Failed to fetch all foodItems. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch all food items. Please try again later"
      );
      setAllFoodItems(null);
    } finally {
      setIsPageChanging(false);
      setIsPageLoading(false);
    }
  }, [slug, tabName, currentPage, searchInput]);

  const fetchRestaurantCategories = useCallback(async () => {
    if (!slug) {
      toast.error("Restaurant slug is required to fetch categories");
      return;
    }
    try {
      const response = await axios.get(`/restaurant/${slug}/categories`);
      setRestaurantCategories(response.data.data);
    } catch (error) {
      console.error(
        "Failed to fetch all categories. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch all categories. Please try again later"
      );
      setRestaurantCategories([]);
    }
  }, [slug]);

  const fetchTableDetails = useCallback(async () => {
    if (!tableId) {
      toast.error("Table ID is required to fetch table details");
      setIsTableDataLoading(false);
      setTableDetails(null);
      return;
    }
    setIsTableDataLoading(true);
    try {
      const response = await axios.get(`/table/${slug}/${tableId}`);
      setTableDetails(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error(axiosError.response?.data.message || axiosError.message);
      console.error(
        "Failed to fetch table details. Please try again later:",
        axiosError.response?.data.message || axiosError.message
      );
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch table details. Please try again later"
      );
    } finally {
      setIsTableDataLoading(false);
    }
  }, [tableId, slug]);

  useEffect(() => {
    if (slug) {
      syncCart();
    }
    fetchTableDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, fetchTableDetails]);

  useEffect(() => {
    if (tableDetails && tableDetails.isOccupied === false) {
      fetchFoodItems();
    }
  }, [fetchFoodItems, tableDetails]);

  useEffect(() => {
    if (tableDetails && tableDetails.isOccupied === false) {
      fetchRestaurantCategories();
    }
  }, [fetchRestaurantCategories, tableDetails]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries && Array.isArray(entries) && entries[0]?.isIntersecting) {
          if (
            allFoodItems &&
            allFoodItems?.totalPages > currentPage &&
            allFoodItems.page === currentPage
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
    [allFoodItems, currentPage, tabName, isPageChanging]
  );

  useEffect(() => {
    setIsPageLoading(true);
    setAllFoodItems(null);
    setTabPages((prev) => ({
      ...prev,
      [tabName]: 1,
    }));
  }, [tabName]);

  if (isTableDataLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="animate-spin mx-auto" />
        <p>Please wait while we load the table data...</p>
      </div>
    );
  }

  if (!tableDetails) {
    return (
      <div className="p-4 text-center text-balance">
        Sorry, we couldn&apos;t find your table details. Please refresh the page
        or scan the QR code again.
      </div>
    );
  }

  if (tableDetails.isOccupied) {
    return (
      <div className="p-4 text-center text-balance">
        This table is currently occupied. Please try again later. Or contact
        restaurant staff for assistance.
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      <Tabs
      className="mb-24"
        defaultValue="all"
        value={tabName}
        onValueChange={(value) => {
          if (searchInputRef.current) {
            searchInputRef.current.value = "";
          }
          setSearchInput("");
          setTabName(value);
        }}
      >
        <ScrollArea className="w-full pb-3">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger
                value="all"
                className="font-medium data-[state=active]:font-semibold data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200"
                onClick={() => setTabName("all")}
              >
                All
              </TabsTrigger>
              {restaurantCategories.map((tab, label) => (
                <TabsTrigger
                  key={label}
                  value={tab}
                  className="font-medium data-[state=active]:font-semibold data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200"
                  onClick={() => setTabName(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            <div
              className="flex items-center gap-2 *:flex flex-wrap pl-2 py-1 rounded-lg overflow-hidden border-zinc-400 cursor-text focus-within:ring-1 border focus-within:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 bg-transparent mr-1"
              onClick={() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
            >
              <Search className="size-4 shrink-0 opacity-50" />
              <Input
                className="w-60 placeholder:text-muted-foreground flex rounded-md bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 outline-0 border-none h-6 min-w-fit flex-1 focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 px-1 shadow-none dark:bg-transparent"
                placeholder="Search food items by name, category, tags..."
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
                      return;
                    }
                    setTabName("search");
                    fetchFoodItems();
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
                  searchInputRef.current && searchInputRef.current.value !== ""
                    ? ""
                    : "invisible"
                )}
              >
                <X />
              </Button>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContent value={tabName} className="mt-2">
          {isPageLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className={`animate-pulse py-0 gap-0 ${index > 0 ? `delay-${(index + 1) * 100}` : ""}`}
                >
                  <div className="relative aspect-square">
                    <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-t-xl"></div>
                  </div>
                  <CardContent className="p-3">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allFoodItems &&
            Array.isArray(allFoodItems.foodItems) &&
            allFoodItems.foodItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {allFoodItems.foodItems.map((foodItem, index) => (
                <Card
                  key={foodItem._id}
                  ref={
                    index === allFoodItems.foodItems.length - 1
                      ? lastElementRef
                      : null
                  }
                  className={cn(
                    "overflow-hidden transition-all duration-200 hover:scale-101 hover:shadow-md cursor-pointer group py-0 gap-0 relative",
                    !foodItem.isAvailable &&
                      !foodItem.hasVariants &&
                      "grayscale opacity-80"
                  )}
                  onClick={() => {
                    setSelectedFoodItem(foodItem);
                    setShowEditDrawer(false);
                    setDrawerOpen(true);
                  }}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className={`border ${foodItem.foodType === "veg" ? "border-green-500" : ""} ${foodItem.foodType === "non-veg" ? "border-red-500" : ""} outline outline-white bg-white p-0.5 cursor-help`}
                        >
                          <span
                            className={`${foodItem.foodType === "veg" ? "bg-green-500" : ""} ${foodItem.foodType === "non-veg" ? "bg-red-500" : ""} w-1.5 h-1.5 block rounded-full`}
                          ></span>
                          <span className="sr-only">
                            {foodItem.foodType === "veg"
                              ? "Veg"
                              : foodItem.foodType === "non-veg"
                                ? "Non Veg"
                                : "Vegan"}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {foodItem.foodType === "veg"
                          ? "Veg"
                          : foodItem.foodType === "non-veg"
                            ? "Non Veg"
                            : "Vegan"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative aspect-square">
                    {foodItem.imageUrls &&
                    foodItem.imageUrls.length > 0 &&
                    foodItem.imageUrls[0] ? (
                      <Image
                        src={foodItem.imageUrls[0]}
                        alt={foodItem.foodName}
                        fill
                        priority={index < 3} // Load first 3 images with priority
                        loading={index < 3 ? "eager" : "lazy"}
                        draggable={false}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-all duration-200 group-hover:scale-101"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <IconSalad className="size-8 sm:size-16" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 relative">
                    <div className="space-y-1">
                      <h3 className="font-semibold line-clamp-1">
                        {foodItem.foodName}
                      </h3>
                      {typeof foodItem.discountedPrice === "number" ? (
                        <p className="text-sm font-medium">
                          {" "}
                          ₹{foodItem.discountedPrice.toFixed(2)}
                          <span className="line-through ml-2 text-xs text-muted-foreground font-normal">
                            ₹{foodItem.price.toFixed(2)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm font-medium">
                          ₹{foodItem.price.toFixed(2)}
                        </p>
                      )}
                      {foodItem.isAvailable || foodItem.hasVariants ? (
                        cartItems.some(
                          (item) => item.foodId === foodItem._id
                        ) ? (
                          <div className="flex items-center justify-between gap-2 dark:border-zinc-600 border rounded-md w-full">
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-sm h-8 gap-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                const existingItem = cartItems.find(
                                  (item) => item.foodId === foodItem._id
                                );
                                if (existingItem && foodItem.hasVariants) {
                                  setSelectedFoodItem(foodItem);
                                  setShowEditDrawer(true);
                                  setDrawerOpen(true);
                                } else {
                                  setShowEditDrawer(false);
                                  if (
                                    existingItem &&
                                    existingItem.quantity > 1
                                  ) {
                                    editItem({
                                      ...existingItem,
                                      quantity: existingItem.quantity - 1,
                                    });
                                  } else {
                                    removeItem(existingItem!);
                                  }
                                }
                              }}
                            >
                              <Minus />
                              <span className="sr-only">Remove from cart</span>
                            </Button>
                            <span className="text-sm">
                              {cartItems
                                .filter((item) => item.foodId === foodItem._id)
                                .reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-sm h-8 gap-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                const existingItem = cartItems.find(
                                  (item) => item.foodId === foodItem._id
                                );
                                if (existingItem && foodItem.hasVariants) {
                                  setSelectedFoodItem(foodItem);
                                  setShowEditDrawer(true);
                                  setDrawerOpen(true);
                                } else {
                                  setShowEditDrawer(false);
                                  if (existingItem) {
                                    editItem({
                                      ...existingItem,
                                      quantity: existingItem.quantity + 1,
                                    });
                                  } else {
                                    addItem({
                                      foodId: foodItem._id,
                                      quantity: 1,
                                      foodName: foodItem.foodName,
                                      price: foodItem.price,
                                      discountedPrice: foodItem.discountedPrice,
                                      imageUrl: foodItem.imageUrls?.[0],
                                      foodType: foodItem.foodType,
                                      isAvailable: foodItem.isAvailable,
                                      description: foodItem.description,
                                      restaurantSlug: slug,
                                    });
                                  }
                                }
                              }}
                            >
                              <Plus />
                              <span className="sr-only">Add to cart</span>
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="text-sm h-8 gap-0 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (foodItem.hasVariants) {
                                setSelectedFoodItem(foodItem);
                                setShowEditDrawer(false);
                                setDrawerOpen(true);
                              } else {
                                addItem({
                                  foodId: foodItem._id,
                                  quantity: 1,
                                  foodName: foodItem.foodName,
                                  price: foodItem.price,
                                  discountedPrice: foodItem.discountedPrice,
                                  imageUrl: foodItem.imageUrls?.[0],
                                  foodType: foodItem.foodType,
                                  isAvailable: foodItem.isAvailable,
                                  description: foodItem.description,
                                  restaurantSlug: slug,
                                });
                              }
                            }}
                          >
                            <Plus /> Add to Cart
                          </Button>
                        )
                      ) : (
                        <Button
                          variant="outline"
                          className="text-sm h-8 gap-0 w-full"
                          disabled
                        >
                          Unavailable
                        </Button>
                      )}
                      {foodItem.hasVariants && (
                        <p className="text-[10px] text-muted-foreground text-center absolute bottom-0 left-1/2 -translate-x-1/2">
                          *Variants available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {selectedFoodItem && (
                <CustomerFoodDetails
                  foodItem={selectedFoodItem}
                  setAllFoodItems={setAllFoodItems}
                  restaurantSlug={slug}
                  showEditDrawer={showEditDrawer}
                  setDrawerOpen={setDrawerOpen}
                  drawerOpen={drawerOpen}
                />
              )}

              {(isPageChanging || allFoodItems.totalPages !== currentPage) &&
                Array.from({ length: 6 }).map((_, index) => (
                  <Card
                    key={index}
                    className={`animate-pulse py-0 gap-0 ${index > 0 ? `delay-${(index + 1) * 100}` : ""}`}
                  >
                    <div className="relative aspect-square">
                      <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-t-xl"></div>
                    </div>
                    <CardContent className="p-3">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="@container/card">
              <CardFooter className="flex-col gap-4 text-sm flex justify-center">
                <div className="line-clamp-1 flex gap-2 font-medium text-center text-balance">
                  No food items found
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      {(cartItems && cartItems.length > 0) && (
        <div className="fixed bottom-2 w-full md:w-1/3 right-0 rounded-md bg-primary text-background z-30">
          <Link href={`/${slug}/cart/?tableId=${tableId}`} scroll={false} passHref className="flex items-center justify-center p-4 font-semibold">
            View Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
          </Link>
        </div>
      )}
    </div>
  );
};

export default MenuClientPage;
