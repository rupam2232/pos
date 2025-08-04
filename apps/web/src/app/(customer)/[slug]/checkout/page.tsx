"use client";
import Link from "next/link";
import React from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { editCartItem, removeFromCart } from "@/store/cartSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { CreditCard, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import { IconSalad } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

const CheckoutPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart);
  const { slug: restaurantSlug } = useParams<{ slug: string }>();

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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${restaurantSlug}/menu`}
          className="text-primary hover:text-primary/80 mb-4 inline-block"
        >
          ← Back to Menu
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900">Checkout</h1>
      </div>
      {restaurantCartItems.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-bold">Your cart is empty</p>
              <p className="text-muted-foreground mb-6">
                Add some delicious items from {restaurantSlug}&apos;s menu
              </p>
              <Link href={`/${restaurantSlug}/menu`}>
                <Button className="bg-primary hover:bg-primary/90">
                  Browse Menu
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>Your Items</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card className="mb-28 gap-4">
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
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
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2 fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-lg bg-background/40 max-w-2xl mx-auto">
            <Button className="w-full transition-colors">
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
            <Link href={`/${restaurantSlug}/menu`}>
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
