import { Button } from "@repo/ui/components/button";
// import { Input } from "@repo/ui/components/input";
// import { Label } from "@repo/ui/components/label";
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
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import type { Table, TableDetails } from "@repo/ui/types/Table";

const TableDetails = ({
  children,
  table,
  isSelected,
  handleDeselectTable,
  restaurantSlug,
}: {
  children: React.ReactNode;
  table: Table;
  isSelected: boolean;
  handleDeselectTable: () => void;
  restaurantSlug: string;
}) => {
  const [tableDetails, setTableDetails] = useState<TableDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

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

  return (
    <Sheet
      defaultOpen={isSelected}
      onOpenChange={(e) => {
        if (!e) {
          handleDeselectTable();
        } else {
          fetchTableDetails();
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {tableDetails
              ? `Table: ${tableDetails.tableName}`
              : "Table Details"}
          </SheetTitle>
          <SheetDescription>
            {tableDetails
              ? `Details for table ${tableDetails.tableName}`
              : "No table selected"}
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading...</p>
          </div>
        ) : tableDetails ? (
          <div className="grid flex-1 auto-rows-min gap-4 px-4 text-sm font-medium">
            <div className="flex items-center justify-between">
              <p>Table Name: {tableDetails.tableName}</p>
                <Button
                    variant="outline"
                >
                  Download QR Code
                </Button>
            </div>
            <p>Seat Count: {tableDetails.seatCount}</p>
            <p>QR Code Slug: {tableDetails.qrSlug}</p>
            <p>Status: {tableDetails.isOccupied ? "Occupied" : "Available"}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No details available for this table.</p>
          </div>
        )}
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TableDetails;
