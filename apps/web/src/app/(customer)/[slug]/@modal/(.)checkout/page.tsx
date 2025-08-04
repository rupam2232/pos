"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/drawer";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { editCartItem, removeFromCart } from "@/store/cartSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { CreditCard, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import { IconSalad } from "@tabler/icons-react";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import { useState } from "react";

const CheckoutModalPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart);
  const { slug: restaurantSlug } = useParams<{ slug: string }>();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  
  const restaurantCartItems = cartItems.filter(
    (item) => item.restaurantSlug === restaurantSlug
  );
  // const restaurantCartItemCount = restaurantCartItems.reduce(
  //   (count, item) => count + item.quantity,
  //   0
  // );

  const restaurantCartItemSubtotal = restaurantCartItems.reduce(
    (total, item) => {
      if (
        typeof item.discountedPrice === "number" &&
        !isNaN(item.discountedPrice)
      ) {
        return total + item.discountedPrice * item.quantity;
      }
      return total + item.price * item.quantity;
    },
    0
  );

  const preDiscountedPrice = restaurantCartItems.some(
    (item) =>
      typeof item.discountedPrice === "number" && !isNaN(item.discountedPrice)
  )
    ? restaurantCartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0)
    : null;

  return (
    <Drawer
      open={drawerOpen}
      onOpenChange={(open) => {
        setDrawerOpen(open);
        if (!open) {
          router.back();
        }
      }}
    >
      <DrawerTrigger>Checkout</DrawerTrigger>
      <DrawerContent className="w-full h-full data-[vaul-drawer-direction=bottom]:max-h-[85vh]">
        <div className="w-full md:mx-auto md:w-2xl lg:w-3xl h-full">
          <DrawerTitle className="px-6 pb-2 border-b text-lg">
            Checkout
          </DrawerTitle>
          <ScrollArea className="h-full pb-6 md:py-2">
            <div className="px-6">
              {restaurantCartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-bold">Your cart is empty</p>
                  <p className="text-muted-foreground">
                    Add some delicious items from {restaurantSlug}&apos;s menu
                  </p>
                </div>
              ) : (
                <div>
                  {restaurantCartItems.map((item) => (
                    <div
                      key={item.foodId}
                      className="flex items-center space-x-4 pt-2 pb-4 border-b last:border-b-0 last:pb-0 relative"
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          width={64}
                          height={64}
                          draggable={false}
                          sizes="(max-width: 640px) 100px, (min-width: 641px) 150px"
                          priority
                          alt={item.foodName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center bg-muted w-16 h-16 rounded-lg">
                          <IconSalad className="size-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`border ${item.foodType === "veg" ? "border-green-500" : ""} ${item.foodType === "non-veg" ? "border-red-500" : ""} outline outline-white bg-white p-0.5`}
                          >
                            <span
                              className={`${item.foodType === "veg" ? "bg-green-500" : ""} ${item.foodType === "non-veg" ? "bg-red-500" : ""} w-1.5 h-1.5 block rounded-full`}
                            ></span>
                            <span className="sr-only">
                              {item.foodType === "veg"
                                ? "Veg"
                                : item.foodType === "non-veg"
                                  ? "Non Veg"
                                  : "Vegan"}
                            </span>
                          </div>
                          <h4 className="font-medium line-clamp-1">
                            {item.foodName}{" "}
                            {item.variantName && `(${item.variantName})`}
                          </h4>
                        </div>

                        {typeof item.discountedPrice === "number" &&
                        !isNaN(item.discountedPrice) ? (
                          <p className="text-sm font-medium">
                            {" "}
                            ₹{item.discountedPrice.toFixed(2)}
                            <span className="line-through ml-2 text-xs text-muted-foreground font-normal">
                              ₹{item.price.toFixed(2)}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm font-medium">
                            ₹{item.price.toFixed(2)}
                          </p>
                        )}

                        <div className="flex items-center space-x-2 mt-2 dark:border-zinc-600 border rounded-md w-min">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.quantity > 1) {
                                dispatch(
                                  editCartItem({
                                    foodId: item.foodId,
                                    quantity: item.quantity - 1,
                                  })
                                );
                              } else {
                                dispatch(removeFromCart(item.foodId));
                              }
                            }}
                            className="w-8 h-8"
                          >
                            <Minus className="w-3 h-3" />
                            <span className="sr-only">Remove from cart</span>
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(
                                editCartItem({
                                  foodId: item.foodId,
                                  quantity: item.quantity + 1,
                                })
                              );
                            }}
                            className="w-8 h-8"
                          >
                            <Plus className="w-3 h-3" />
                            <span className="sr-only">Add to cart</span>
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        {typeof item.discountedPrice === "number" &&
                        !isNaN(item.discountedPrice) ? (
                          <p className="text-sm font-medium flex flex-col items-end">
                            <span className="line-through ml-2 text-xs text-muted-foreground font-normal">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                            ₹{(item.discountedPrice * item.quantity).toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-sm font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(removeFromCart(item.foodId))}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="py-6 border-t mb-40">
                    <div className="space-y-2 mb-4">
                      <h3 className="text-lg font-semibold">Bill Details</h3>
                      <div className="flex justify-between text-sm">
                        <span>Sub Total</span>
                        <div className="flex items-center space-x-2">
                          {preDiscountedPrice && (
                            <span className="text-xs line-through opacity-70">
                              ₹{preDiscountedPrice.toFixed(2)}
                            </span>
                          )}
                          <span>₹{restaurantCartItemSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                      {/* <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>
                          ₹{(restaurantCartItemSubtotal * 0.1).toFixed(2)}
                        </span>
                      </div> */}
                      <hr />
                      <div className="flex justify-between font-bold text-lg">
                        <span>To Pay</span>
                        <span>₹{restaurantCartItemSubtotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <DrawerFooter className="flex flex-col gap-2 absolute bottom-14 left-0 right-0 p-4 border-t backdrop-blur-lg bg-background/40">
                      <Button className="w-full transition-colors">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </Button>

                      <DrawerClose asChild>
                        <Button variant="outline" className="w-full">
                          Continue Shopping
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
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

export default CheckoutModalPage;
