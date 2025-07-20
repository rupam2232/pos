import React, { useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import type { FoodItemDetails } from "@repo/ui/types/FoodItem";
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
import { foodItemSchema } from "@/schemas/foodItemSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Button } from "@repo/ui/components/button";
import { Check, ChevronsUpDown, Loader2, Pen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";
import { TagsInput } from "@repo/ui/components/tags-input";

type CreateUpdateFoodItemProps = {
  isEditing?: boolean; // Optional prop to indicate if it's for editing an existing item
  foodItemDetails?: FoodItemDetails | null; // Optional prop to pass food item details when editing
  formLoading?: boolean; // Optional prop to control form loading state
  setFormLoading?: React.Dispatch<React.SetStateAction<boolean>>; // Optional prop to set form loading state
};

const CreateUpdateFoodItem = ({
  isEditing = false, // Default to false if not provided
  foodItemDetails,
  formLoading = false, // Optional prop to control form loading state
  setFormLoading, // Optional prop to set form loading state
}: CreateUpdateFoodItemProps) => {
  const closeDialog = useRef<HTMLButtonElement>(null);

  const form = useForm<z.infer<typeof foodItemSchema>>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      foodName: foodItemDetails?.foodName || "",
      price: foodItemDetails?.price || 0,
      discountedPrice: foodItemDetails?.discountedPrice || undefined,
      category: foodItemDetails?.category || undefined,
      foodType: foodItemDetails?.foodType || "veg",
      description: foodItemDetails?.description || "",
      tags: foodItemDetails?.tags || [],
      imageUrls: foodItemDetails?.imageUrls || [],
      hasVariants: foodItemDetails?.hasVariants || false,
      variants: foodItemDetails?.variants || [],
    },
  });

  const onSubmit = async (data: z.infer<typeof foodItemSchema>) => {
    console.log(data);
    setFormLoading?.(false); // Set form loading state if provided
    //   if (isLoading || formLoading) return; // Prevent multiple submissions
    //   if (!user || user.role !== "owner") {
    //     toast.error("You do not have permission to edit tables");
    //     return;
    //   }
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

  return (
    <Dialog>
      <DialogTrigger className="w-2/4" type="button">
        <Pen />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <ScrollArea className="overflow-y-auto max-h-[90vh]">
          <DialogHeader className="p-6">
            <DialogTitle className="mb-4">
              {isEditing
                ? `Editing Food Item: ${foodItemDetails?.foodName}`
                : "Create Food Item"}
            </DialogTitle>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="foodName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="foodName">Food Name</FormLabel>
                        <FormControl>
                          <Input
                            id="foodName"
                            type="text"
                            placeholder="E.g., Pizza"
                            autoComplete="off"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Name of the food item.
                          <span className="text-muted-foreground block">
                            Note: every food name must be unique.
                          </span>
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="price">Price</FormLabel>
                        <FormControl>
                          <Input
                            id="price"
                            type="number"
                            placeholder="E.g., 100"
                            autoComplete="off"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          The original price of the food item. Must be a
                          positive number.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountedPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="discountedPrice">
                          Discounted Price
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="discountedPrice"
                            type="number"
                            placeholder="E.g., 80"
                            autoComplete="off"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Optional discounted price for the food item. Must be a
                          positive number.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="foodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="foodType">Food Type</FormLabel>
                        <FormControl>
                          <Select {...field}>
                            <SelectTrigger className="text-sm font-medium w-[180px] border-muted-foreground/70">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="veg">
                                <div className="w-min border border-primary p-0.5 bg-background ml-1">
                                  <span className="bg-green-500 w-1.5 h-1.5 block rounded-full"></span>
                                </div>
                                Veg
                              </SelectItem>
                              <SelectItem value="non-veg">
                                <div className="w-min border border-primary p-0.5 bg-background ml-1">
                                  <span className="bg-red-500 w-1.5 h-1.5 block rounded-full"></span>
                                </div>
                                Non Veg
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Type of food (e.g., &quot;veg&quot; or &quot;non
                          veg&quot;).
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="category">Category</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-[200px] justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? foodItemDetails?.restaurantDetails.categories.find(
                                        (category) => category === field.value
                                      )
                                    : "Select category"}
                                  <ChevronsUpDown className="opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Search category..."
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    No category found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      onSelect={() => {
                                        form.setValue("category", undefined);
                                      }}
                                    >
                                      No category
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          undefined === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                    {foodItemDetails?.restaurantDetails.categories.map(
                                      (category) => (
                                        <CommandItem
                                          value={category}
                                          key={category}
                                          onSelect={() => {
                                            form.setValue("category", category);
                                          }}
                                        >
                                          {category}
                                          <Check
                                            className={cn(
                                              "ml-auto",
                                              category === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        </CommandItem>
                                      )
                                    )}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Optional category for the food item.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="description">Description</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Textarea
                              id="description"
                              placeholder="E.g., Cheese pizza with fresh toppings"
                              autoComplete="on"
                              className="resize-none pb-4 whitespace-pre-wrap break-all"
                              {...field}
                            />
                          </FormControl>
                          <span className="absolute bottom-[1px] right-1 text-xs">
                            {field?.value?.length || 0}/200
                          </span>
                        </div>
                        <FormMessage />
                        <FormDescription>
                          Optional description for the food item.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="tags">Tags</FormLabel>
                        <FormControl>
                          <TagsInput
                            id="tags"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="E.g., Cheese pizza with fresh toppings"
                            className="resize-none pb-4 whitespace-pre-wrap break-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Optional description for the food item.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditing ? (
                      "Update Food Item"
                    ) : (
                      "Create Food Item"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogHeader>
        </ScrollArea>
      </DialogContent>
      <DialogClose ref={closeDialog} className="hidden" />
    </Dialog>
  );
};

export default CreateUpdateFoodItem;
