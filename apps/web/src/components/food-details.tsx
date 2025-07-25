import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { signOut } from "@/store/authSlice";
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
import { Loader2, X } from "lucide-react";
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
import { ScrollArea, ScrollBar } from "@repo/ui/components/scroll-area";
import { Badge } from "@repo/ui/components/badge";
import CreateUpdateFoodItem from "./create-update-foodItem";

const FoodDetails = ({
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
  const [isFoodItemAvailable, setIsFoodItemAvailable] =
    useState<boolean>(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselCurrent, setCarouselCurrent] = useState<number>(0);
  const [carouselCount, setCarouselCount] = useState<number>(0);
  const [foodVariant, setFoodVariant] = useState<FoodVariant | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const sheetCloseRef = useRef<HTMLButtonElement>(null);

  const fetchFoodItemDetails = useCallback(async () => {
    if (!foodItem || !foodItem._id) {
      console.warn("No food item selected or food item does not have an ID");
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
      setIsFoodItemAvailable(response.data.data.isAvailable);
      setFoodItemDetails(response.data.data);
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
  }, [dispatch, restaurantSlug, router, foodItem]);

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

  const toggleAvailableStatus = async () => {
    if (!foodItemDetails) return;
    if (isLoading || formLoading) {
      toast.error("Please wait for the current operation to complete");
      return;
    } // Prevent multiple submissions
    try {
      setFormLoading(true);
      const response = await axios.patch(
        `/food-item/${restaurantSlug}/${foodItemDetails._id}/toggle-availability`
      );
      if (
        !response.data.success ||
        !response.data.data ||
        response.data.data.isAvailable === undefined
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
          isAvailable: response.data.data.isAvailable ?? prev.isAvailable,
        };
      });
      setAllFoodItems((prev) => {
        if (!prev) return prev; // If allFoodItems is null, return it
        return {
          ...prev,
          foodItems: prev.foodItems.map((f) =>
            f._id === foodItemDetails._id
              ? {
                  ...f,
                  isAvailable: response.data.data.isAvailable,
                }
              : f
          ),
        };
      });
      toast.success("Food item status updated successfully!");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "An error occurred during food item status update"
      );
      console.error(
        axiosError.response?.data.message ||
          "An error occurred during food item status update"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
      setIsFoodItemAvailable((prev) => !prev); // Toggle back the status on error
    } finally {
      setFormLoading(false);
    }
  };

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
    <Sheet
      onOpenChange={(open) => {
        if (open) {
          fetchFoodItemDetails();
        } else {
          setFoodVariant(null);
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full">
        <ScrollArea className="h-full py-1">
          <SheetHeader>
            <SheetTitle>
              {foodItemDetails
                ? `Food Item: ${foodItemDetails.foodName}`
                : "Food Item Details"}
            </SheetTitle>
            <SheetDescription>
              {foodItemDetails
                ? `View details and manage food item`
                : "Select a food item to view its details."}
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : foodItemDetails ? (
            <div className="grid flex-1 auto-rows-min space-y-4 px-4 text-sm font-medium">
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
                    {foodItemDetails.imageUrls &&
                    foodItemDetails.imageUrls.length > 0 ? (
                      foodItemDetails.imageUrls.map((url, index) => (
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
                            className="object-cover rounded-xl h-auto w-auto"
                            fill
                          />
                        </CarouselItem>
                      ))
                    ) : (
                      <p className="flex items-center mx-auto text-muted-foreground text-xs">
                        No images available for this food item.
                      </p>
                    )}
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
              {foodItemDetails.hasVariants &&
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
                )}
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
                  <div className="flex items-center justify-between gap-2">
                    <p className="whitespace-pre-wrap">
                      Food Name:{" "}
                      <span className="font-bold">
                        {foodItemDetails.foodName}
                      </span>
                    </p>
                  </div>
                  <p>
                    Price:{" "}
                    <span className="font-bold">
                      ₹{foodItemDetails.price.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    Discounted Price:{" "}
                    <span
                      className={`${typeof foodItemDetails.discountedPrice !== "number" || isNaN(foodItemDetails.discountedPrice) ? "text-muted-foreground" : "font-bold"}`}
                    >
                      {typeof foodItemDetails.discountedPrice === "number" &&
                      !isNaN(foodItemDetails.discountedPrice)
                        ? `₹${foodItemDetails.discountedPrice.toFixed(2)}`
                        : "No discounted price set"}
                    </span>
                  </p>
                  <div className="flex items-center gap-1">
                    Food Type:{" "}
                    <div
                      className={`w-min border border-primary p-0.5 bg-background ml-1`}
                    >
                      <span
                        className={`${foodItemDetails.foodType === "veg" ? "bg-green-500" : ""} ${foodItemDetails.foodType === "non-veg" ? "bg-red-500" : ""} w-1.5 h-1.5 block rounded-full`}
                      ></span>
                    </div>
                    <span className="font-bold">
                      {foodItemDetails.foodType === "veg"
                        ? "Veg"
                        : foodItemDetails.foodType === "non-veg"
                          ? "Non Veg"
                          : "Vegan"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    Status:
                    <Select
                      value={
                        isFoodItemAvailable ? "available" : "not available"
                      }
                      disabled={!user}
                      defaultValue={
                        foodItem.isAvailable ? "available" : "not available"
                      }
                      onValueChange={() => {
                        setIsFoodItemAvailable((prev) => !prev);
                        toggleAvailableStatus();
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
                      className={`${!foodItemDetails.description ? "text-muted-foreground" : "font-bold"}`}
                    >
                      {foodItemDetails.description ||
                        "No description available"}
                    </span>
                  </p>
                  <p className="whitespace-pre-wrap">
                    Category:{" "}
                    <span
                      className={`${!foodItemDetails.category ? "text-muted-foreground" : "font-bold"}`}
                    >
                      {foodItemDetails.category || "No category available"}
                    </span>
                  </p>
                  <div>
                    <p className="inline">Tags:</p>
                    {foodItemDetails.tags && foodItemDetails.tags.length > 0 ? (
                      foodItemDetails.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="mx-1 my-1"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground ml-1">
                        No tags available
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>No details available for this food item.</p>
            </div>
          )}
          {!isLoading && (
            <SheetFooter className="flex flex-row items-center justify-between">
              <SheetClose asChild ref={sheetCloseRef}>
                <Button variant="outline">Close</Button>
              </SheetClose>
              {user?.role === "owner" && (
                <CreateUpdateFoodItem
                  isEditing={true}
                  foodItemDetails={foodItemDetails}
                  formLoading={formLoading}
                  setFormLoading={setFormLoading}
                  restaurantSlug={restaurantSlug}
                  setFoodItemDetails={setFoodItemDetails}
                  setAllFoodItems={setAllFoodItems}
                />
              )}
            </SheetFooter>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default FoodDetails;
