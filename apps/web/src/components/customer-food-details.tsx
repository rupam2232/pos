import { cn } from "@repo/ui/lib/utils";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@repo/ui/components/drawer";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { signOut } from "@/store/authSlice";
import { addToCart, editCartItem, removeFromCart } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import type {
  FoodItem,
  AllFoodItems,
  FoodItemDetails,
  FoodVariant,
} from "@repo/ui/types/FoodItem";
import { Loader2, Minus, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@repo/ui/components/carousel";
import Image from "next/image";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Badge } from "@repo/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { DialogTitle } from "@repo/ui/components/dialog";

const CustomerFoodDetails = ({
  children,
  foodItem,
  setAllFoodItems,
  restaurantSlug,
}: {
  children: React.ReactNode;
  foodItem: FoodItem;
  setAllFoodItems: React.Dispatch<React.SetStateAction<AllFoodItems | null>>;
  restaurantSlug: string;
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [foodItemDetails, setFoodItemDetails] =
    useState<FoodItemDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselCurrent, setCarouselCurrent] = useState<number>(0);
  const [carouselCount, setCarouselCount] = useState<number>(0);
  const [foodVariant, setFoodVariant] = useState<FoodVariant | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const isMobile = useIsMobile();
  const cartItems = useSelector((state: RootState) => state.cart);

  const fetchFoodItemDetails = useCallback(async () => {
    if (!foodItem || !foodItem._id) {
      toast.error("Something went wrong. Please refresh the page");
      setFoodItemDetails(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/food-item/${restaurantSlug}/${foodItem._id}`
      );
      setFoodItemDetails(response.data.data);
      setAllFoodItems((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          foodItems: prev.foodItems.map((item) =>
            item._id === foodItem._id ? { ...response.data.data } : item
          ),
        };
      });
    } catch (error) {
      console.error(
        "Failed to fetch food item details. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch food item details. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
      setFoodItemDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, restaurantSlug, router, foodItem, setAllFoodItems]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    setCarouselCount(carouselApi.scrollSnapList().length);
    setCarouselCurrent(carouselApi.selectedScrollSnap() + 1);
    carouselApi.on("select", () => {
      setCarouselCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi]);

  const toggleVariantAvailability = async () => {
    if (!foodItemDetails || !foodVariant) return;
    if (isLoading || formLoading) {
      toast.error("Please wait for the current operation to complete");
      return;
    } // Prevent multiple submissions
    try {
      setFormLoading(true);
      const response = await axios.patch(
        `/food-item/${restaurantSlug}/${foodItemDetails._id}/toggle-availability`,
        {
          isVariant: true,
          variantId: foodVariant._id,
        }
      );
      if (
        !response.data.success ||
        !response.data.data ||
        response.data.data.variants.find(
          (v: FoodVariant) => v._id === foodVariant._id
        )?.isAvailable === undefined
      ) {
        toast.error(
          response.data.message || "Failed to update food item status"
        );
        return;
      }
      setFoodItemDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          variants: prev.variants?.map((v) =>
            v._id === foodVariant._id
              ? {
                  ...v,
                  isAvailable:
                    response.data.data.variants.find(
                      (variant: FoodVariant) => variant._id === v._id
                    )?.isAvailable ?? v.isAvailable,
                }
              : v
          ),
        };
      });

      setFoodVariant((prev) => {
        if (!prev || prev._id !== foodVariant._id) return prev; // If the variant is not selected, return it
        return {
          ...prev,
          isAvailable:
            response.data.data.variants.find(
              (variant: FoodVariant) => variant._id === prev._id
            )?.isAvailable ?? prev.isAvailable,
        };
      });
      toast.success("Food variant status updated successfully!");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "An error occurred during food variant status update"
      );
      console.error(
        axiosError.response?.data.message ||
          "An error occurred during food variant status update"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
      setFoodVariant((prev) => {
        if (!prev || prev._id !== foodVariant._id) return prev;
        return {
          ...prev,
          isAvailable: !prev.isAvailable,
        };
      }); // Toggle back the status on error
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Drawer
      onOpenChange={(open) => {
        setDrawerOpen(open);
        if (open) {
          fetchFoodItemDetails();
        } else {
          setFoodVariant(null);
        }
      }}
      open={drawerOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="w-full h-full data-[vaul-drawer-direction=bottom]:max-h-[85vh]">
        <ScrollArea className="h-full pt-3 pb-6 md:py-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : foodItemDetails ? (
            <div className="grid flex-1 auto-rows-min space-y-3 p-4">
              <DialogTitle className="sr-only">Food Item Details</DialogTitle>
              {foodItemDetails.imageUrls &&
                foodItemDetails.imageUrls.length > 0 && (
                  <div>
                    <Carousel
                      setApi={setCarouselApi}
                      className="rounded-xl w-full max-w-xs mx-auto"
                    >
                      <CarouselContent
                        setCarouselCount={setCarouselCount}
                        setCarouselCurrent={setCarouselCurrent}
                        className="aspect-square ml-0"
                      >
                        {foodItemDetails.imageUrls.map((url, index) => (
                          <CarouselItem
                            key={index}
                            className="relative rounded-xl"
                          >
                            <Image
                              src={url}
                              alt={`Food Item Image ${index + 1}`}
                              priority={index < 2} // Load first 2 images with priority
                              loading={index < 2 ? "eager" : "lazy"}
                              draggable={false}
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                              className="object-cover rounded-xl h-auto w-auto"
                              fill
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2 z-10" />
                      <CarouselNext className="right-2 z-10" />
                    </Carousel>
                    <p className="text-muted-foreground py-2 text-center text-sm">
                      {foodItemDetails.imageUrls &&
                      foodItemDetails.imageUrls.length > 0 ? (
                        <>
                          Slide {carouselCurrent} of {carouselCount}
                        </>
                      ) : (
                        <>Slide 0 of 0</>
                      )}
                    </p>
                  </div>
                )}
              {/* {foodItemDetails.hasVariants &&
                Array.isArray(foodItemDetails.variants) &&
                foodItemDetails.variants?.length > 0 && (
                  <div className="mb-0!">
                    <p className="whitespace-pre-wrap">Variants</p>
                    <ScrollArea className="pt-2 pb-3 w-[93vw] sm:max-w-[340px] rounded-md border whitespace-nowrap border-none">
                      <div className="flex items-center w-max space-x-3">
                        {foodItemDetails.variants.map((variant) => (
                          <Button
                            variant={
                              foodVariant && foodVariant._id === variant._id
                                ? "default"
                                : "outline"
                            }
                            type="button"
                            key={variant._id}
                            className="font-bold"
                            onClick={() =>
                              setFoodVariant((prev) =>
                                prev && prev._id === variant._id
                                  ? null
                                  : variant
                              )
                            }
                          >
                            {variant.variantName}{" "}
                            {foodVariant && foodVariant._id === variant._id && (
                              <X />
                            )}
                          </Button>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                )} */}
              {foodVariant &&
              foodItemDetails.variants?.find(
                (v) => v._id === foodVariant._id
              ) ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <p className="whitespace-pre-wrap">
                      Variant Name:{" "}
                      <span className="font-bold">
                        {foodVariant.variantName}
                      </span>
                    </p>
                  </div>
                  <p>
                    Price:{" "}
                    <span className="font-bold">
                      ₹{foodVariant.price.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    Discounted Price:{" "}
                    <span
                      className={`${typeof foodVariant.discountedPrice !== "number" || isNaN(foodVariant.discountedPrice) ? "text-muted-foreground" : "font-bold"}`}
                    >
                      {typeof foodVariant.discountedPrice === "number" &&
                      !isNaN(foodVariant.discountedPrice)
                        ? `₹${foodVariant.discountedPrice.toFixed(2)}`
                        : "No discounted price set"}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    Status:
                    <Select
                      value={
                        foodVariant.isAvailable ? "available" : "not available"
                      }
                      disabled={!user}
                      defaultValue={
                        foodVariant.isAvailable ? "available" : "not available"
                      }
                      onValueChange={() => {
                        setFoodVariant((prev) => {
                          if (!prev || prev._id !== foodVariant._id)
                            return prev;
                          return {
                            ...prev,
                            isAvailable: !prev.isAvailable,
                          };
                        });
                        toggleVariantAvailability();
                      }}
                    >
                      <SelectTrigger className="text-sm font-medium w-[180px] border-muted-foreground/70">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Available
                        </SelectItem>
                        <SelectItem value="not available">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Not Available
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="whitespace-pre-wrap">
                    Description:{" "}
                    <span
                      className={`${!foodVariant.description ? "text-muted-foreground" : "font-bold"}`}
                    >
                      {foodVariant.description || "No description available"}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className={`border ${foodItemDetails.foodType === "veg" ? "border-green-500" : ""} ${foodItemDetails.foodType === "non-veg" ? "border-red-500" : ""} outline outline-white bg-white p-0.5 cursor-help`}
                          >
                            <span
                              className={`${foodItemDetails.foodType === "veg" ? "bg-green-500" : ""} ${foodItemDetails.foodType === "non-veg" ? "bg-red-500" : ""} w-1 h-1 block rounded-full`}
                            ></span>
                            <span className="sr-only">
                              {foodItemDetails.foodType === "veg"
                                ? "Veg"
                                : foodItemDetails.foodType === "non-veg"
                                  ? "Non Veg"
                                  : "Vegan"}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {foodItemDetails.foodType === "veg"
                            ? "Veg"
                            : foodItemDetails.foodType === "non-veg"
                              ? "Non Veg"
                              : "Vegan"}
                        </TooltipContent>
                      </Tooltip>
                      <p className="whitespace-pre-wrap font-bold text-xl">
                        {foodItemDetails.foodName}
                      </p>
                    </div>
                    {foodItemDetails.isAvailable ? (
                      cartItems.some(
                        (item) =>
                          item.foodId === foodItemDetails._id &&
                          item.restaurantSlug === restaurantSlug
                      ) ? (
                        <div className="flex items-center gap-2 dark:border-zinc-600 border rounded-md">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-sm h-8 gap-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              const existingItem = cartItems.find(
                                (item) =>
                                  item.foodId === foodItemDetails._id &&
                                  item.restaurantSlug === restaurantSlug
                              );
                              if (existingItem && existingItem.quantity > 1) {
                                dispatch(
                                  editCartItem({
                                    foodId: existingItem.foodId,
                                    quantity: existingItem.quantity - 1,
                                  })
                                );
                              } else {
                                dispatch(removeFromCart(foodItemDetails._id));
                              }
                            }}
                          >
                            <Minus />
                            <span className="sr-only">Remove from cart</span>
                          </Button>
                          <span className="text-sm">
                            {
                              cartItems.find(
                                (item) =>
                                  item.foodId === foodItemDetails._id &&
                                  item.restaurantSlug === restaurantSlug
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
                                  item.foodId === foodItemDetails._id &&
                                  item.restaurantSlug === restaurantSlug
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
                                    foodId: foodItemDetails._id,
                                    quantity: 1,
                                    restaurantSlug: restaurantSlug,
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
                          className="text-sm h-8 gap-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(
                              addToCart({
                                foodId: foodItemDetails._id,
                                quantity: 1,
                                restaurantSlug: restaurantSlug,
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
                        className="text-sm h-8 gap-0"
                        disabled
                      >
                        Not Available
                      </Button>
                    )}
                  </div>
                  {typeof foodItemDetails.discountedPrice === "number" &&
                  !isNaN(foodItemDetails.discountedPrice) ? (
                    <p className="text-lg font-semibold">
                      {" "}
                      ₹{foodItemDetails.discountedPrice.toFixed(2)}
                      <span className="line-through ml-2 text-xs text-muted-foreground">
                        ₹{foodItemDetails.price.toFixed(2)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-lg font-semibold">
                      ₹{foodItemDetails.price.toFixed(2)}
                    </p>
                  )}

                  {foodItemDetails.description && (
                    <p className="whitespace-pre-wrap text-md text-muted-foreground line-clamp-2">
                      {foodItemDetails.description}
                    </p>
                  )}

                  {foodItemDetails.tags && foodItemDetails.tags.length > 0 && (
                    <div>
                      <p className="">Tags:</p>
                      {foodItemDetails.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="mx-1 my-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>No details available for this food item.</p>
            </div>
          )}
        </ScrollArea>
        <DrawerClose
          asChild
          className={cn(
            "absolute right-1/2 translate-x-1/2 z-10 transition-all duration-200",
            drawerOpen ? "-top-14 opacity-100" : "-top-0 opacity-0"
          )}
        >
          <Button variant="outline" className="rounded-full px-2.5! py-1.5!">
            <X />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
};

export default CustomerFoodDetails;
