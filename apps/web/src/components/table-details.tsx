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
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import type { Table, TableDetails, AllTables } from "@repo/ui/types/Table";
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
import TableQRCode from "./table-qrcode";

const TableDetails = ({
  children,
  table,
  setAllTables,
  isSelected,
  handleDeselectTable,
  restaurantSlug,
}: {
  children: React.ReactNode;
  table: Table;
  setAllTables: React.Dispatch<React.SetStateAction<AllTables | null>>;
  isSelected: boolean;
  handleDeselectTable: () => void;
  restaurantSlug: string;
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [tableDetails, setTableDetails] = useState<TableDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const sheetCloseRef = useRef<HTMLButtonElement>(null);

  const fetchTableDetails = useCallback(async () => {
    if (!table || !table.qrSlug) {
      console.warn("No table selected or table does not have a qrSlug");
      setTableDetails(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/table/${restaurantSlug}/${table.qrSlug}`
      );
      setTableDetails(response.data.data);
    } catch (error) {
      console.error(
        "Failed to fetch table details. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch table details. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
      setTableDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, restaurantSlug, router, table]);

  const form = useForm<z.infer<typeof tableSchema>>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableName: table.tableName,
      seatCount: table.seatCount || 1, // Default to 1 if not provided
    },
  });

  const onSubmit = async (data: z.infer<typeof tableSchema>) => {
    if (isLoading || formLoading) return; // Prevent multiple submissions
    if (!user || user.role !== "owner") {
      toast.error("You do not have permission to create a restaurant");
      return;
    }
    if (
      form.getValues("tableName") === table.tableName &&
      form.getValues("seatCount") === table.seatCount
    ) {
      toast.error(
        "No changes detected. Please modify the table details before submitting"
      );
      return;
    }
    try {
      setFormLoading(true);
      const response = await axios.patch(
        `/table/${restaurantSlug}/${table.qrSlug}`,
        data
      );
      if (!response.data.success || !response.data.data) {
        toast.error(response.data.message || "Failed to create restaurant");
        return;
      }
      setTableDetails(response.data.data);
      setIsEditing(false);
      setAllTables((prev) => {
        if (!prev) return prev; // If allTables is null, return it
        return {
          ...prev,
          tables: prev.tables.map((t) =>
            t.qrSlug === table.qrSlug ? { ...t, ...response.data.data } : t
          ),
        };
      });
      toast.success(response.data.message || "Table updated successfully!");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "An error occurred during table update"
      );
      console.error(
        axiosError.response?.data.message ||
          "An error occurred during table update"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const toggleOccupiedStatus = async () => {
    if (!tableDetails) return;
    if (isLoading || formLoading) {
      toast.error("Please wait for the current operation to complete");
      return;
    } // Prevent multiple submissions
    try {
      setFormLoading(true);
      const response = await axios.patch(
        `/table/${restaurantSlug}/${tableDetails.qrSlug}/toggle-occupied`
      );
      if (!response.data.success || !response.data.data || response.data.data.isOccupied === undefined) {
        toast.error(response.data.message || "Failed to update table status");
        return;
      }
      setTableDetails((prev) => {
        if (!prev) return prev;
        return { ...prev, isOccupied: response.data.data.isOccupied };
      });
      setAllTables((prev) => {
        if (!prev) return prev; // If allTables is null, return it
        return {
          ...prev,
          tables: prev.tables.map((t) =>
            t.qrSlug === tableDetails.qrSlug
              ? { ...t, isOccupied: response.data.data.isOccupied }
              : t
          ),
        };
      });
      toast.success("Table status updated successfully!");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "An error occurred during table status update"
      );
      console.error(
        axiosError.response?.data.message ||
          "An error occurred during table status update"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Sheet
      defaultOpen={isSelected}
      onOpenChange={(e) => {
        if (!e) {
          setIsEditing(false);
          handleDeselectTable();
        } else {
          fetchTableDetails();
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full">
        <SheetHeader>
          <SheetTitle>
            {isEditing
              ? `Editing Table: ${table.tableName}`
              : tableDetails
                ? `Table: ${tableDetails.tableName}`
                : "Table Details"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Edit the details of this table."
              : tableDetails
                ? `View details and manage table`
                : "Select a table to view its details."}
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
        ) : tableDetails ? (
          <div className="grid flex-1 auto-rows-min gap-4 px-4 text-sm font-medium">
              
              <TableQRCode qrCodeData={`${window.location.origin}/${tableDetails?.restaurantDetails?.slug}/table/${tableDetails.qrSlug}`} qrCodeImage={tableDetails.restaurantDetails.logoUrl?.replace("/upload/", "/upload/r_max/")} qrCodeName={tableDetails.tableName + "-qrcode"}
              slug={tableDetails.qrSlug} />
              <p>
                Table Name:{" "}
                <span className="font-bold">{tableDetails.tableName} adf adfa fadf asf adsfa dfadsf adsfdsf daf</span>
              </p>
            <p>
              Seat Count:{" "}
              <span className="font-bold">{tableDetails.seatCount}</span>
            </p>
            <p className="flex items-center gap-2">
              Status:
              <Select
                defaultValue={
                  tableDetails.isOccupied ? "occupied" : "available"
                }
                onValueChange={() => toggleOccupiedStatus()}
              >
                <SelectTrigger className="text-sm font-medium w-[180px] border-muted-foreground/70">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </p>

            {tableDetails.currentOrder &&
              tableDetails.currentOrder.foodItems &&
              Array.isArray(tableDetails.currentOrder.foodItems) &&
              tableDetails.currentOrder.foodItems.length > 0 && (
                <div>
                  <p>Order Details</p>
                  <div className="grid gap-2">
                    <p>
                      Order ID:{" "}
                      <span className="font-bold">
                        {tableDetails.currentOrder.orderId}
                      </span>
                    </p>
                    <p>
                      Status:{" "}
                      <span className="font-bold">
                        {tableDetails.currentOrder.status}
                      </span>
                    </p>
                    <p>
                      Final Amount:{" "}
                      <span className="font-bold">
                        ${tableDetails.currentOrder.finalAmount.toFixed(2)}
                      </span>
                    </p>
                    <p>Food Items:</p>
                    <ul className="list-disc pl-5">
                      {tableDetails.currentOrder.foodItems.map((item) => (
                        <li key={item.foodItemId}>
                          {item.variantName
                            ? `${item.variantName} (x${item.quantity}) - $${item.finalPrice.toFixed(2)}`
                            : `Item ID: ${item.foodItemId} (x${item.quantity}) - $${item.finalPrice.toFixed(2)}`}
                        </li>
                      ))}
                    </ul>
                    <p>
                      Created At:{" "}
                      <span className="font-bold">
                        {new Date(
                          tableDetails.currentOrder.createdAt
                        ).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              )}
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
      </SheetContent>
    </Sheet>
  );
};

export default TableDetails;
