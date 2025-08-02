"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { AllFoodItems } from "@repo/ui/types/FoodItem";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "@/store/authSlice";
import { addToCart, editCartItem, removeFromCart } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import type { AppDispatch, RootState } from "@/store/store";
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
import { Minus, Plus, Search, X } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";
import { Button } from "@repo/ui/components/button";
import CustomerFoodDetails from "@/components/customer-food-details";

const MenuPage = () => {
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const observer = useRef<IntersectionObserver>(null);
  const debounced = useDebounceCallback(setSearchInput, 300);
  const currentPage = tabPages[tabName] || 1;
  const cartItems = useSelector((state: RootState) => state.cart);

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
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
      setAllFoodItems(null);
    } finally {
      setIsPageChanging(false);
      setIsPageLoading(false);
    }
  }, [slug, router, dispatch, tabName, currentPage, searchInput]);

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
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
      setRestaurantCategories([]);
    }
  }, [slug, router, dispatch]);

  useEffect(() => {
    fetchRestaurantCategories();
  }, [fetchRestaurantCategories]);

  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

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

  return (
    <div className="p-4">
      <Tabs
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
              <TabsTrigger
                value="available"
                className="font-medium data-[state=active]:font-semibold data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200"
                onClick={() => setTabName("available")}
              >
                Available
              </TabsTrigger>
              <TabsTrigger
                value="unavailable"
                className="font-medium data-[state=active]:font-semibold data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200"
                onClick={() => setTabName("unavailable")}
              >
                Unavailable
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
                      toast.error("Search input cannot be empty");
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
                <CustomerFoodDetails
                  key={foodItem._id}
                  foodItem={foodItem}
                  setAllFoodItems={setAllFoodItems}
                  restaurantSlug={slug}
                >
                  <Card
                    ref={
                      index === allFoodItems.foodItems.length - 1
                        ? lastElementRef
                        : null
                    }
                    className={cn(
                      "overflow-hidden transition-all duration-200 hover:scale-101 hover:shadow-md cursor-pointer group py-0 gap-0 relative",
                      !foodItem.isAvailable && "grayscale opacity-80"
                    )}
                  >
                    <div className={"absolute top-2 right-2 z-10"}>
                      {/* <Tooltip>
                        <TooltipTrigger>
                        <span
                            className={cn(
                              "block w-2 h-2 rounded-full",
                              foodItem.isAvailable
                                ? "bg-green-500"
                                : "bg-red-500"
                            )}
                          ></span>
                          <span className="sr-only">
                            {foodItem.isAvailable
                              ? "Available"
                              : "Not Available"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {foodItem.isAvailable ? "Available" : "Not Available"}
                        </TooltipContent>
                      </Tooltip> */}
                    </div>
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
                    <CardContent className="p-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold line-clamp-1">
                          {foodItem.foodName}
                        </h3>
                        {typeof foodItem.discountedPrice === "number" &&
                        !isNaN(foodItem.discountedPrice) ? (
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
                        {foodItem.isAvailable ? (
                          cartItems.some(
                            (item) =>
                              item.foodId === foodItem._id &&
                              item.restaurantSlug === slug
                          ) ? (
                            <div className="flex items-center justify-between gap-2 dark:border-zinc-600 border rounded-md w-full">
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-sm h-8 gap-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const existingItem = cartItems.find(
                                    (item) =>
                                      item.foodId === foodItem._id &&
                                      item.restaurantSlug === slug
                                  );
                                  if (
                                    existingItem &&
                                    existingItem.quantity > 1
                                  ) {
                                    dispatch(
                                      editCartItem({
                                        foodId: existingItem.foodId,
                                        quantity: existingItem.quantity - 1,
                                      })
                                    );
                                  } else {
                                    dispatch(removeFromCart(foodItem._id));
                                  }
                                }}
                              >
                                <Minus />
                                <span className="sr-only">
                                  Remove from cart
                                </span>
                              </Button>
                              <span className="text-sm">
                                {
                                  cartItems.find(
                                    (item) =>
                                      item.foodId === foodItem._id &&
                                      item.restaurantSlug === slug
                                  )?.quantity
                                }
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-sm h-8 gap-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const existingItem = cartItems.find(
                                    (item) =>
                                      item.foodId === foodItem._id &&
                                      item.restaurantSlug === slug
                                  );
                                  if (existingItem) {
                                    dispatch(
                                      editCartItem({
                                        foodId: existingItem.foodId,
                                        quantity: existingItem.quantity + 1,
                                      })
                                    );
                                  } else {
                                    dispatch(
                                      addToCart({
                                        foodId: foodItem._id,
                                        quantity: 1,
                                        restaurantSlug: slug,
                                      })
                                    );
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
                                dispatch(
                                  addToCart({
                                    foodId: foodItem._id,
                                    quantity: 1,
                                    restaurantSlug: slug,
                                  })
                                );
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
                            Not Available
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CustomerFoodDetails>
              ))}
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
    </div>
  );
};

export default MenuPage;
