"use client";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import axios from "@/utils/axiosInstance";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "@/store/authSlice";
import { AllTables } from "@repo/ui/types/Table";
import { cn } from "@repo/ui/lib/utils";
import ClinetFoodMenu from "@/components/food-menu";
import { Check, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import Image from "next/image";
import { IconSalad } from "@tabler/icons-react";
import { Textarea } from "@repo/ui/components/textarea";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Skeleton } from "@repo/ui/components/skeleton";
import Link from "next/link";
import { RootState } from "@/store/store";

const Page = () => {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [step, setStep] = useState<number>(1);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [allTables, setAllTables] = useState<AllTables | null>(null);
  const [isTablePageLoading, setIsTablePageLoading] = useState<boolean>(false);
  const [isTablePageChanging, setIsTablePageChanging] =
    useState<boolean>(false);
  const [tableId, setTableId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver>(null);
  const { cartItems, syncCart, removeItem, editItem, clearCart } =
    useCart(slug);
  const [notes, setNotes] = useState<string>("");
  const [taxDetails, setTaxDetails] = useState<{
    isTaxIncludedInPrice: boolean;
    taxLabel: string;
    taxRate: number;
  }>();
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  const fetchAllTables = useCallback(async () => {
    if (!slug) {
      console.error("Restaurant slug is required to fetch tables");
      toast.error("Restaurant slug is required to fetch tables");
      return;
    }
    if (!drawerOpen) {
      return;
    }
    try {
      if (page === 1) {
        setIsTablePageLoading(true);
        const response = await axios.get(`/table/${slug}`);
        setAllTables(response.data.data);
      } else {
        setIsTablePageChanging(true);
        const response = await axios.get(`/table/${slug}?page=${page}`);
        setAllTables((prev) => ({
          ...response.data.data,
          tables: [...(prev?.tables || []), ...response.data.data.tables],
        }));
      }
    } catch (error) {
      console.error(
        "Failed to fetch all tables. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch all tables. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
      setAllTables(null);
    } finally {
      setIsTablePageChanging(false);
      setIsTablePageLoading(false);
    }
  }, [slug, router, dispatch, page, drawerOpen]);

  useEffect(() => {
    fetchAllTables();
  }, [fetchAllTables]);

  const lastTableElementRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries && Array.isArray(entries) && entries[0]?.isIntersecting) {
        if (allTables && allTables?.totalPages > page) {
          if (!isTablePageChanging) {
            setPage((prevPageNumber) => prevPageNumber + 1);
          }
        }
      }
    });
    if (node) observer.current.observe(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (slug) {
      syncCart().then((e) => {
        setTaxDetails(e.payload?.taxDetails);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const restaurantCartItemSubtotal = cartItems.reduce((total, item) => {
    if (typeof item.discountedPrice === "number") {
      return total + item.discountedPrice * item.quantity;
    }
    return total + item.price * item.quantity;
  }, 0);

  const preDiscountedPrice = cartItems.some(
    (item) => typeof item.discountedPrice === "number"
  )
    ? cartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0)
    : null;

  const toPay =
    restaurantCartItemSubtotal +
    (taxDetails && !taxDetails.isTaxIncludedInPrice
      ? restaurantCartItemSubtotal * taxDetails.taxRate
      : 0);

  const confirmOrder = async () => {
    const toastId = toast.loading("Placing order...");
    try {
      const response = await axios.post(`/order/${slug}/${tableId}`, {
        foodItems: cartItems.map((item) => ({
          _id: item.foodId,
          quantity: item.quantity,
          variantName: item.variantName || undefined,
        })),
        notes: notes,
        paymentMethod: "cash",
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      });
      toast.success(response.data.message || "Order placed successfully!", {
        id: toastId,
      });
      clearCart();
      setDrawerOpen(false);
      router.back();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error(axiosError.response?.data.message || axiosError.message);
      toast.error(
        axiosError.response?.data.message ||
          "Failed to place order. Please try again.",
        {
          id: toastId,
        }
      );
    }
  };

  return (
    <Dialog
      open={drawerOpen}
      onOpenChange={(open) => {
        setDrawerOpen(open);
        if (!open) {
          router.back();
        }
      }}
    >
      <DialogTrigger className="hidden">Open Dialog</DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-screen">
        <DialogHeader>
          <DialogTitle className="pb-2! p-6">
            {step === 1
              ? "Select Table"
              : step === 2
                ? "Select Food Items"
                : "Confirm Order"}
          </DialogTitle>
          <div className="overflow-y-auto h-[calc(100vh-11rem)] sm:h-[calc(100vh-8rem)] px-6 custom-scrollbar">
            {step === 1 && (
              <>
                {isTablePageLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 px-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-20 w-full" />
                    ))}
                  </div>
                ) : allTables && allTables.tables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 px-2">
                    {allTables.tables.map((t, index) => (
                      <div
                        ref={
                          index === allTables.tables.length - 1
                            ? lastTableElementRef
                            : undefined
                        }
                        role="button"
                        onClick={() => {
                          if (!t.isOccupied) {
                            setTableId(t.qrSlug);
                          }
                        }}
                        key={t._id}
                        className={cn(
                          "rounded-md ring-3 ring-transparent cursor-pointer transition-all duration-200 relative",
                          t.isOccupied
                            ? "hover:ring-destructive"
                            : "hover:ring-primary",
                          t.isOccupied && "opacity-50 cursor-not-allowed",
                          tableId === t.qrSlug && "ring-primary"
                        )}
                      >
                        {tableId === t.qrSlug && (
                          <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rounded-xl bg-primary">
                            <Check className="text-white size-4" />
                          </span>
                        )}
                        <div
                          className={cn(
                            "rounded-md p-3 flex flex-col items-center justify-center text-sm truncate",
                            t.isOccupied
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : "bg-green-50 text-green-700 border border-green-100"
                          )}
                        >
                          <h3 className="font-medium">{t.tableName}</h3>
                          <div className="text-xs">
                            {t.isOccupied ? "Occupied" : "Available"}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTablePageChanging &&
                      Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="w-full min-h-[60px]" />
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-col space-y-4 h-full">
                    <p className="text-center text-muted-foreground">
                      No tables created yet. Please create a table to proceed.
                    </p>
                    {user?.role === "owner" && (
                      <Link href={`/restaurant/${slug}/tables`}>
                        <Button type="button">Create a new table</Button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
            {step === 2 && (
              <ClinetFoodMenu
                slug={slug}
                tableId={tableId}
                isStaffCreatingOrder={true}
                scrollClassName="max-w-[calc(100vw-4rem)] overflow-y-auto"
              />
            )}
            {step === 3 && (
              <>
                {cartItems.length === 0 ? (
                  <Card>
                    <CardContent>
                      <div className="text-center py-8">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg font-bold">Your cart is empty</p>
                        <p className="text-muted-foreground mb-6">
                          Add some delicious items from {slug}&apos;s menu
                        </p>
                        <Button className="bg-primary hover:bg-primary/90">
                          Browse Menu
                        </Button>
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
                        {cartItems.map((item) => (
                          <div
                            key={item.foodId + (item.variantName || "")}
                            className="flex flex-col sm:flex-row sm:items-center space-x-4 pt-2 pb-4 border-b first:border-t last:border-b-0 last:pb-0 relative"
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
                                className={cn(
                                  "w-16 h-16 object-cover rounded-lg",
                                  item.isAvailable
                                    ? "opacity-100"
                                    : "opacity-80 grayscale"
                                )}
                              />
                            ) : (
                              <div
                                className={cn(
                                  "flex items-center justify-center bg-muted w-16 h-16 rounded-lg",
                                  item.isAvailable
                                    ? "opacity-100"
                                    : "opacity-80 grayscale"
                                )}
                              >
                                <IconSalad className="size-5" />
                              </div>
                            )}
                            <div className="flex flex-1 items-center">
                              <div
                                className={cn(
                                  "flex-1 min-w-0",
                                  item.isAvailable
                                    ? "opacity-100"
                                    : "opacity-80 grayscale"
                                )}
                              >
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
                                  <h4 className="font-medium line-clamp-3">
                                    {item.foodName}{" "}
                                    {item.variantName &&
                                      `(${item.variantName})`}
                                  </h4>
                                </div>

                                {typeof item.discountedPrice === "number" ? (
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
                                    disabled={item.isAvailable === false}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.quantity > 1) {
                                        editItem({
                                          ...item,
                                          quantity: item.quantity - 1,
                                        });
                                      } else {
                                        removeItem(item);
                                      }
                                    }}
                                    className="w-8 h-8"
                                  >
                                    <Minus className="w-3 h-3" />
                                    <span className="sr-only">
                                      Remove from cart
                                    </span>
                                  </Button>
                                  <span className="text-sm font-medium w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={item.isAvailable === false}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      editItem({
                                        ...item,
                                        quantity: item.quantity + 1,
                                      });
                                    }}
                                    className="w-8 h-8"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span className="sr-only">Add to cart</span>
                                  </Button>
                                </div>
                              </div>

                              <div className="text-right">
                                {item.isAvailable === false ? (
                                  <p className="text-sm font-medium">
                                    Unavailable
                                  </p>
                                ) : typeof item.discountedPrice === "number" ? (
                                  <p className="text-sm font-medium flex flex-col items-end">
                                    <span className="line-through ml-2 text-xs text-muted-foreground font-normal">
                                      ₹{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                    ₹
                                    {(
                                      item.discountedPrice * item.quantity
                                    ).toFixed(2)}
                                  </p>
                                ) : (
                                  <p className="text-sm font-medium">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Textarea
                      className="my-4 border rounded-md bg-muted resize-none text-wrap whitespace-pre-wrap min-h-11 max-h-40"
                      placeholder="Add special instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <Card className="gap-4">
                      <CardHeader>
                        <CardTitle>Bill Summary</CardTitle>
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
                              <span>
                                ₹{restaurantCartItemSubtotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {taxDetails && !taxDetails.isTaxIncludedInPrice && (
                            <div className="flex justify-between text-sm">
                              <span>{taxDetails.taxLabel}</span>
                              <span>
                                ₹
                                {(
                                  restaurantCartItemSubtotal *
                                  taxDetails.taxRate
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <hr />
                          <div className="flex justify-between font-bold text-lg">
                            <span>To Pay</span>
                            <span>₹{toPay.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="mb-18 gap-4">
                      <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer-name">Customer Name</Label>
                          <Input
                            id="customer-name"
                            placeholder="Enter Customer Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer-phone">Customer Phone</Label>
                          <Input
                            id="customer-phone"
                            placeholder="Enter Customer Phone"
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogHeader>
        <DialogFooter className="rounded-b-lg px-6 py-4 fixed -bottom-[0.1px] left-0 right-0 bg-background justify-between! z-20">
          {step === 1 && (
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
              <Button
                type="button"
                disabled={!tableId}
                onClick={() => setStep(2)}
              >
                Go to Menu
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Go back to Tables
              </Button>
              <Button
                type="button"
                disabled={cartItems.length === 0}
                onClick={() => setStep(3)}
              >
                View Cart ({cartItems.length})
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                Go back to Menu
              </Button>
              <Button type="button" onClick={confirmOrder}>
                Place Order
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Page;
