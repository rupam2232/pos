"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { AllFoodItems } from "@repo/ui/types/FoodItem";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import type { AppDispatch } from "@/store/store";
import { Card, CardContent } from "@repo/ui/components/card";
import Image from "next/image";
import { cn } from "@repo/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

const MenuPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [allFoodItems, setAllFoodItems] = useState<AllFoodItems | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isPageChanging, setIsPageChanging] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const observer = useRef<IntersectionObserver>(null);

  const fetchAllFoodItems = useCallback(async () => {
    if (!slug) {
      toast.error("Restaurant slug is required to fetch food items");
      return;
    }
    try {
      if (page === 1) {
        setIsPageLoading(true);
        const response = await axios.get(`/food-item/${slug}`);
        setAllFoodItems(response.data.data);
      } else {
        setIsPageChanging(true);
        const response = await axios.get(`/food-item/${slug}?page=${page}`);
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
  }, [slug, router, dispatch, page]);

  useEffect(() => {
    fetchAllFoodItems();
  }, [slug, fetchAllFoodItems, page]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries && Array.isArray(entries) && entries[0]?.isIntersecting) {
        if (allFoodItems && allFoodItems?.totalPages > page) {
          if (isPageChanging) return;
          setPage((prevPageNumber) => prevPageNumber + 1);
        }
      }
    });
    if (node) observer.current.observe(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4">
      {isPageLoading ? (
        <div>Loading...</div>
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
              className="overflow-hidden transition-all duration-200 hover:scale-101 hover:shadow-md cursor-pointer group py-0 gap-0 relative"
            >
              <div className={"absolute top-2 right-2 z-10"}>
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className={cn(
                        "block w-2 h-2 rounded-full",
                        foodItem.isAvailable ? "bg-green-500" : "bg-red-500"
                      )}
                    ></span>
                    <span className="sr-only">
                      {foodItem.isAvailable ? "Available" : "Not Available"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {foodItem.isAvailable ? "Available" : "Not Available"}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="absolute top-2 left-2 z-10">
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`border border-primary p-0.5 cursor-help`}>
                      <span
                        className={`${foodItem.foodType !== "veg" ? "bg-green-500" : ""} ${foodItem.foodType === "non-veg" ? "bg-red-500" : ""} w-1.5 h-1.5 block rounded-full`}
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
                <Image
                  src={foodItem.imageUrls?.[0] || "/placeholder.svg"}
                  alt={foodItem.foodName}
                  fill
                  className="object-cover transition-all duration-200 group-hover:scale-101"
                />
              </div>
              <CardContent className="p-3">
                <div>
                  <h3 className="font-medium line-clamp-1">
                    {foodItem.foodName}
                  </h3>
                  {foodItem.discountedPrice ? (
                    <p className="text-lg font-semibold">
                      {" "}
                      ₹{foodItem.discountedPrice.toFixed(2)}
                      <span className="line-through ml-2 text-xs">
                        ₹{foodItem.price.toFixed(2)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-lg font-semibold">
                      ₹{foodItem.price.toFixed(2)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No food items found for this restaurant.
        </div>
      )}
    </div>
  );
};

export default MenuPage;
