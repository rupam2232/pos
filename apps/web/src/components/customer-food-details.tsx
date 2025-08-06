import { cn } from "@repo/ui/lib/utils";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/drawer";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import type {
  FoodItem,
  AllFoodItems,
  FoodItemDetails,
} from "@repo/ui/types/FoodItem";
import { Loader2, Minus, Plus, X } from "lucide-react";
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
import { useCart } from "@/hooks/useCart";
import { Label } from "@repo/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";

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
  const [foodItemDetails, setFoodItemDetails] =
    useState<FoodItemDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselCurrent, setCarouselCurrent] = useState<number>(0);
  const [carouselCount, setCarouselCount] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  // const cartItems = useSelector((state: RootState) => state.cart);
  const { cartItems, addItem, removeItem, editItem } = useCart(restaurantSlug);

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
      setFoodItemDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantSlug, foodItem, setAllFoodItems]);

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

  return (
    <Drawer
      onOpenChange={(open) => {
        setDrawerOpen(open);
        if (open) {
          fetchFoodItemDetails();
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
            <>
              <div className="grid flex-1 auto-rows-min space-y-3 p-4 mb-14">
                <DrawerTitle className="sr-only">Food Item Details</DrawerTitle>
                <Card className="gap-2 py-3 bg-muted/50">
                  <CardContent className="px-3">
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
                    <CardHeader className="px-0 gap-0">
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
                          <CardTitle className="whitespace-pre-wrap font-bold text-xl">
                            {foodItemDetails.foodName}
                          </CardTitle>
                        </div>
                        {foodItemDetails.isAvailable ? (
                          cartItems.some(
                            (item) => item.foodId === foodItemDetails._id
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
                                      item.foodId === foodItemDetails._id
                                  );
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
                                      item.foodId === foodItemDetails._id
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
                                      item.foodId === foodItemDetails._id
                                  );
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
                                      restaurantSlug: restaurantSlug,
                                    });
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
                                  restaurantSlug: restaurantSlug,
                                });
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
                    </CardHeader>
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
                      <CardDescription className="whitespace-pre-wrap">
                        {foodItemDetails.description}
                      </CardDescription>
                    )}
                  </CardContent>
                </Card>

                {foodItemDetails.variants &&
                  foodItemDetails.variants.length > 0 && (
                    <Card className="gap-2 pb-0 pt-1 bg-muted/50">
                      <CardHeader className="px-3 gap-0">
                        <CardTitle className="whitespace-pre-wrap text-lg font-semibold">
                          Variants
                        </CardTitle>
                        <CardDescription>
                          Select a variant for this food item. Select Default if
                          you want the standard option.
                        </CardDescription>
                      </CardHeader>
                      <Separator className="mx-1" />
                      <CardContent className="px-3">
                        <RadioGroup defaultValue="default" className="gap-0">
                          <div className="flex items-center w-full justify-between">
                            <Label htmlFor="default" className="flex-1 py-2">
                              Default
                            </Label>
                            <RadioGroupItem
                              value="default"
                              id="default"
                              className="border-primary"
                            />
                          </div>
                          {foodItemDetails.variants.map((variant, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between space-x-4 w-full"
                            >
                              <Label
                                htmlFor={`option-${index}`}
                                className="flex-1 justify-between py-2"
                              >
                                {variant.variantName}
                                <div className="text-right">
                                  {typeof variant.discountedPrice ===
                                  "number" ? (
                                    <>
                                      <span className="text-sm font-semibold">
                                        ₹{variant.discountedPrice.toFixed(2)}
                                      </span>
                                      <span className="text-xs line-through text-muted-foreground ml-2">
                                        ₹{variant.price.toFixed(2)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm font-semibold">
                                      ₹{variant.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </Label>

                              <RadioGroupItem
                                value={`option-${index}`}
                                id={`option-${index}`}
                                className="border-primary"
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </CardContent>
                    </Card>
                  )}

                {foodItemDetails.tags && foodItemDetails.tags.length > 0 && (
                  <Card className="gap-2 py-2 bg-muted/50">
                    <CardHeader className="px-3 gap-0">
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <Separator className="mx-1" />
                    <CardContent className="px-3">
                      {foodItemDetails.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="mx-1 my-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="fixed bottom-0 w-full p-3 backdrop-blur-2xl bg-muted/50">
                {foodItemDetails.isAvailable ? (
                  cartItems.some(
                    (item) => item.foodId === foodItemDetails._id
                  ) ? (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2 dark:border-zinc-600 border rounded-md">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-sm h-8 gap-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            const existingItem = cartItems.find(
                              (item) => item.foodId === foodItemDetails._id
                            );
                            if (existingItem && existingItem.quantity > 1) {
                              editItem({
                                ...existingItem,
                                quantity: existingItem.quantity - 1,
                              });
                            } else {
                              removeItem(existingItem!);
                            }
                          }}
                        >
                          <Minus />
                          <span className="sr-only">Remove from cart</span>
                        </Button>
                        <span className="text-sm">
                          {
                            cartItems.find(
                              (item) => item.foodId === foodItemDetails._id
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
                              (item) => item.foodId === foodItemDetails._id
                            );
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
                                restaurantSlug: restaurantSlug,
                              });
                            }
                          }}
                        >
                          <Plus />
                          <span className="sr-only">Add to cart</span>
                        </Button>
                      </div>
                      <Button>Add to Cart</Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="text-sm h-8 gap-0"
                      onClick={(e) => {
                        e.stopPropagation();
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
                          restaurantSlug: restaurantSlug,
                        });
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
            </>
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
