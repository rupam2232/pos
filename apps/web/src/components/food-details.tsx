import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
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
} from "@repo/ui/types/FoodItem";
import { Pen, ArrowLeft, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { tableSchema } from "@/schemas/tableSchema";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [isFoodItemAvailable, setIsFoodItemAvailable] =
    useState<boolean>(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselCurrent, setCarouselCurrent] = useState<number>(0);
  const [carouselCount, setCarouselCount] = useState<number>(0);
  const [isWatchingVariant, setIsWatchingVariant] = useState<boolean>(false);
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

  const form = useForm<z.infer<typeof tableSchema>>({
    resolver: zodResolver(tableSchema),
    // defaultValues: {
    //   tableName: table.tableName,
    //   seatCount: table.seatCount || 1, // Default to 1 if not provided
    // },
  });

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

  const onSubmit = async (data: z.infer<typeof tableSchema>) => {
    if (isLoading || formLoading) return; // Prevent multiple submissions
    if (!user || user.role !== "owner") {
      toast.error("You do not have permission to edit tables");
      return;
    }
    // if (
    //   form.getValues("tableName") === table.tableName &&
    //   form.getValues("seatCount") === table.seatCount
    // ) {
    //   toast.error(
    //     "No changes detected. Please modify the table details before submitting"
    //   );
    //   return;
    // }
    // try {
    //   setFormLoading(true);
    //   const response = await axios.patch(
    //     `/table/${restaurantSlug}/${table.qrSlug}`,
    //     data
    //   );
    //   if (
    //     !response.data.success ||
    //     !response.data.data.table ||
    //     !response.data.data.table.tableName ||
    //     response.data.data.table.seatCount === undefined
    //   ) {
    //     toast.error(response.data.message || "Failed to create restaurant");
    //     return;
    //   }
    //   setTableDetails((prev) => {
    //     if (!prev) return prev;
    //     return {
    //       ...prev,
    //       tableName: response.data.data.table.tableName,
    //       seatCount: response.data.data.table.seatCount,
    //       qrSlug: response.data.data.table.qrSlug ?? prev.qrSlug,
    //       isOccupied: response.data.data.table.isOccupied ?? prev.isOccupied,
    //     };
    //   });
    //   setIsEditing(false);
    //   setAllTables((prev) => {
    //     if (!prev) return prev; // If allTables is null, return it
    //     return {
    //       ...prev,
    //       tables: prev.tables.map((t) =>
    //         t.qrSlug === table.qrSlug
    //           ? {
    //               ...t,
    //               tableName: response.data.data.table.tableName,
    //               seatCount: response.data.data.table.seatCount,
    //               qrSlug: response.data.data.table.qrSlug ?? t.qrSlug,
    //               isOccupied:
    //                 response.data.data.table.isOccupied ?? t.isOccupied,
    //             }
    //           : t
    //       ),
    //       totalCount: response.data.data.totalCount ?? prev.totalCount,
    //       occupiedTables:
    //         response.data.data.occupiedTables ?? prev.occupiedTables,
    //       availableTables:
    //         response.data.data.availableTables ?? prev.availableTables,
    //     };
    //   });
    //   toast.success(response.data.message || "Table updated successfully!");
    // } catch (error) {
    //   const axiosError = error as AxiosError<ApiResponse>;
    //   toast.error(
    //     axiosError.response?.data.message ||
    //       "An error occurred during table update"
    //   );
    //   console.error(
    //     axiosError.response?.data.message ||
    //       "An error occurred during table update"
    //   );
    //   if (axiosError.response?.status === 401) {
    //     dispatch(signOut());
    //     router.push("/signin");
    //   }
    // } finally {
    //   setFormLoading(false);
    // }
  };

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

  return (
    <Sheet
      onOpenChange={(open) => {
        if (open) {
          fetchFoodItemDetails();
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full">
        <ScrollArea className="h-full py-1">
          <SheetHeader>
            <SheetTitle>
              {isEditing
                ? `Editing Food Item: ${foodItem.foodName}`
                : foodItemDetails
                  ? `Food Item: ${foodItemDetails.foodName}`
                  : "Food Item Details"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Edit the details of this food item."
                : foodItemDetails
                  ? `View details and manage food item`
                  : "Select a food item to view its details."}
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : isEditing ? (
            <div className="px-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <ArrowLeft />
                Back to Details
              </Button>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="tableName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="tableName">Table Name</FormLabel>
                          <FormControl>
                            <Input
                              id="tableName"
                              type="text"
                              placeholder="E.g., Table 1"
                              autoComplete="table-name"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Every table name must be unique
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seatCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="seatCount">Seat Count</FormLabel>
                          <FormControl>
                            <Input
                              id="seatCount"
                              type="number"
                              placeholder="E.g., 4"
                              autoComplete="seat-count"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Number of seats at this table
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || formLoading}
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Table"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          ) : foodItemDetails ? (
            <div className="grid flex-1 auto-rows-min space-y-4 px-4 text-sm font-medium">
              <div>
                <Carousel
                  setApi={setCarouselApi}
                  className="rounded-xl w-full max-w-xs mx-auto"
                >
                  <CarouselContent className="aspect-square ml-0">
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
                            className="object-cover rounded-xl h-auto w-auto"
                            fill
                          />
                        </CarouselItem>
                      ))
                    ) : (
                      <p>No images available for this food item.</p>
                    )}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 z-10" />
                  <CarouselNext className="right-2 z-10" />
                </Carousel>
                <p className="text-muted-foreground py-2 text-center text-sm">
                  Slide {carouselCurrent} of {carouselCount}
                </p>
              </div>
              {foodItemDetails.hasVariants &&
                Array.isArray(foodItemDetails.variants) &&
                foodItemDetails.variants?.length > 0 && (
                  <div className="mb-0!">
                    <p className="whitespace-pre-wrap">Variants</p>
                    <ScrollArea className="pt-2 pb-3 w-[93vw] sm:max-w-[340px] rounded-md border whitespace-nowrap border-none">
                      <div className="flex items-center w-max space-x-3">
                        {foodItemDetails.variants?.length > 0 ? (
                          foodItemDetails.variants.map((variant, index) => (
                            <>
                              <Button
                                variant="outline"
                                type="button"
                                key={index}
                                className="font-bold"
                              >
                                {variant.variantName}
                              </Button>
                            </>
                          ))
                        ) : (
                          <span className="font-bold">
                            No variants available
                          </span>
                        )}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                )}
              <div className="flex items-center justify-between gap-2">
                <p className="whitespace-pre-wrap">
                  Food Name:{" "}
                  <span className="font-bold">{foodItemDetails.foodName}</span>
                </p>
              </div>
              <p>
                Price:{" "}
                <span className="font-bold">₹{foodItemDetails.price}</span>
              </p>
              <p>
                Discounted Price:{" "}
                <span
                  className={`${!foodItemDetails.discountedPrice ? "text-muted-foreground" : "font-bold"}`}
                >
                  {foodItemDetails.discountedPrice
                    ? `₹${foodItemDetails.discountedPrice}`
                    : "No discounted price set"}
                </span>
              </p>
              <p className="flex items-center gap-1">
                Food Type:{" "}
                <div
                  className={`w-min border border-primary p-0.5 bg-background ml-1`}
                >
                  <span
                    className={`${foodItemDetails.foodType !== "veg" ? "bg-green-500" : ""} ${foodItemDetails.foodType === "non-veg" ? "bg-red-500" : ""} w-1.5 h-1.5 block rounded-full`}
                  ></span>
                </div>
                <span className="font-bold">
                  {foodItemDetails.foodType === "veg"
                    ? "Veg"
                    : foodItemDetails.foodType === "non-veg"
                      ? "Non Veg"
                      : "Vegan"}
                </span>
              </p>
              <div className="flex items-center gap-2">
                Status:
                <Select
                  value={isFoodItemAvailable ? "available" : "not available"}
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
                  {foodItemDetails.description || "No description available"}
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
                    <Badge key={index} className="mx-1 my-1">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground ml-1">
                    No tags available
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>No details available for this table.</p>
            </div>
          )}
          <SheetFooter className="flex flex-row items-center justify-between">
            <SheetClose asChild ref={sheetCloseRef}>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Close
              </Button>
            </SheetClose>
            {!isEditing && user?.role === "owner" && (
              <Button
                type="submit"
                className="w-2/4"
                onClick={() => setIsEditing(true)}
              >
                <Pen />
                Edit
              </Button>
            )}
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default FoodDetails;
