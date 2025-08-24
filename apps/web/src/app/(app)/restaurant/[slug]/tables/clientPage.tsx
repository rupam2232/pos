"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardFooter } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import { useParams } from "next/navigation";
import TableDetails from "@/components/table-details";
import type { Table, AllTables } from "@repo/ui/types/Table";
import CreateTableDialog from "@/components/create-table";
import type { AppDispatch, RootState } from "@/store/store";

// const getTableSize = (chairs: number) => {
//   if (chairs <= 1) return { width: 80, height: 60 };
//   if (chairs <= 2) return { width: 90, height: 70 };
//   if (chairs <= 4) return { width: 100, height: 80 };
//   if (chairs <= 6) return { width: 110, height: 90 };
//   if (chairs <= 8) return { width: 120, height: 100 };
//   return { width: 100, height: 80 };
// };

// const getChairPositions = (
//   chairs: number,
//   tableSize: { width: number; height: number }
// ) => {
//   const positions = [];
//   const { width, height } = tableSize;
//   const chairSize = 8;

//   if (chairs === 1) {
//     positions.push(
//       { x: width / 2 - chairSize / 2, y: -chairSize - 2 } // top
//     );
//   } else if (chairs === 2) {
//     positions.push(
//       { x: width / 2 - chairSize / 2, y: -chairSize - 2 }, // top
//       { x: width / 2 - chairSize / 2, y: height + 2 } // bottom
//     );
//   } else if (chairs === 3) {
//     positions.push(
//       { x: width / 2 - chairSize / 2, y: -chairSize - 2 }, // top
//       { x: width + 2, y: height / 2 - chairSize / 2 }, // right
//       { x: -chairSize - 2, y: height / 2 - chairSize / 2 } // left
//     );
//   } else if (chairs === 4) {
//     positions.push(
//       { x: width / 2 - chairSize / 2, y: -chairSize - 2 }, // top
//       { x: width / 2 - chairSize / 2, y: height + 2 }, // bottom
//       { x: -chairSize - 2, y: height / 2 - chairSize / 2 }, // left
//       { x: width + 2, y: height / 2 - chairSize / 2 } // right
//     );
//   } else if (chairs === 5) {
//     positions.push(
//       { x: width / 2 - chairSize / 2, y: -chairSize - 2 }, // top
//       { x: width / 4 - chairSize / 2, y: height + 2 }, // bottom left
//       { x: (3 * width) / 4 - chairSize / 2, y: height + 2 }, // bottom right
//       { x: -chairSize - 2, y: height / 2 - chairSize / 2 }, // left
//       { x: width + 2, y: height / 2 - chairSize / 2 } // right
//     );
//   } else if (chairs === 6) {
//     positions.push(
//       { x: width / 4 - chairSize / 2, y: -chairSize - 2 }, // top left
//       { x: (3 * width) / 4 - chairSize / 2, y: -chairSize - 2 }, // top right
//       { x: width / 4 - chairSize / 2, y: height + 2 }, // bottom left
//       { x: (3 * width) / 4 - chairSize / 2, y: height + 2 }, // bottom right
//       { x: -chairSize - 2, y: height / 2 - chairSize / 2 }, // left
//       { x: width + 2, y: height / 2 - chairSize / 2 } // right
//     );
//   } else if (chairs >= 8) {
//     positions.push(
//       { x: width / 4 - chairSize / 2, y: -chairSize - 2 }, // top left
//       { x: (3 * width) / 4 - chairSize / 2, y: -chairSize - 2 }, // top right
//       { x: width / 4 - chairSize / 2, y: height + 2 }, // bottom left
//       { x: (3 * width) / 4 - chairSize / 2, y: height + 2 }, // bottom right
//       { x: -chairSize - 2, y: height / 3 - chairSize / 2 }, // left top
//       { x: -chairSize - 2, y: (2 * height) / 3 - chairSize / 2 }, // left bottom
//       { x: width + 2, y: height / 3 - chairSize / 2 }, // right top
//       { x: width + 2, y: (2 * height) / 3 - chairSize / 2 } // right bottom
//     );
//   } else {
//     positions.push(
//       { x: width / 5 - chairSize / 2, y: -chairSize - 2 }, // top 1
//       { x: (2 * width) / 5 - chairSize / 2, y: -chairSize - 2 }, // top 2
//       { x: (3 * width) / 5 - chairSize / 2, y: -chairSize - 2 }, // top 3
//       { x: (4 * width) / 5 - chairSize / 2, y: -chairSize - 2 }, // top 4
//       { x: width / 5 - chairSize / 2, y: height + 2 }, // bottom 1
//       { x: (2 * width) / 5 - chairSize / 2, y: height + 2 }, // bottom 2
//       { x: (3 * width) / 5 - chairSize / 2, y: height + 2 }, // bottom 3
//       { x: (4 * width) / 5 - chairSize / 2, y: height + 2 }, // bottom 4
//       { x: -chairSize - 2, y: height / 2 - chairSize / 2 }, // left
//       { x: width + 2, y: height / 2 - chairSize / 2 } // right
//     );
//   }

//   return positions;
// };

export default function SelectTable() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isPageChanging, setIsPageChanging] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [allTables, setAllTables] = useState<AllTables | null>(null);
  const observer = useRef<IntersectionObserver>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
  };

  const handleDeselectTable = () => {
    setSelectedTable(null);
  };

  const fetchAllTables = useCallback(async () => {
    if (!slug) {
      console.error("Restaurant slug is required to fetch tables");
      toast.error("Restaurant slug is required to fetch tables");
      return;
    }
    try {
      if (page === 1) {
        setIsPageLoading(true);
        const response = await axios.get(`/table/${slug}`);
        setAllTables(response.data.data);
      } else {
        setIsPageChanging(true);
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
      setIsPageChanging(false);
      setIsPageLoading(false);
    }
  }, [slug, router, dispatch, page]);

  useEffect(() => {
    fetchAllTables();
  }, [slug, fetchAllTables, page]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries && Array.isArray(entries) && entries[0]?.isIntersecting) {
        if (allTables && allTables?.totalPages > page) {
          if (isPageChanging) return;
          setPage((prevPageNumber) => prevPageNumber + 1);
        }
      }
    });
    if (node) observer.current.observe(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        {/* Status Legend - Center */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-300"></span>
            <span className="text-muted-foreground">
              Available: {allTables ? allTables.availableTables : 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-300"></span>
            <span className="text-muted-foreground">
              Occupied: {allTables ? allTables.occupiedTables : 0}
            </span>
          </div>
        </div>
        {allTables &&
          Array.isArray(allTables.tables) &&
          allTables.tables.length > 0 &&
          user?.role === "owner" && (
            <div>
              <CreateTableDialog
                isLoading={isPageLoading}
                restaurantSlug={slug}
                setAllTables={setAllTables}
              />
            </div>
          )}
      </div>

      {/* Main Content Area */}
      {isPageLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-y-12 gap-x-4 p-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <Card className="flex items-center justify-center h-20 w-20 bg-muted text-muted-foreground animate-pulse"></Card>
            </div>
          ))}
        </div>
      ) : allTables &&
        Array.isArray(allTables.tables) &&
        allTables.tables.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
          {allTables.tables.map((table, index) => {
            const isSelected = selectedTable?._id === table._id;
            // const tableSize = getTableSize(table.seatCount);
            // const chairPositions = getChairPositions(
            //   table.seatCount,
            //   tableSize
            // );

            return (
              <TableDetails
                key={table._id}
                table={table}
                setAllTables={setAllTables}
                isSelected={isSelected}
                handleDeselectTable={handleDeselectTable}
                restaurantSlug={slug}
              >
                <div
                  ref={
                    allTables.tables.length - 1 === index
                      ? lastElementRef
                      : null
                  }
                  className={cn(
                    "rounded-md ring-3 ring-transparent cursor-pointer transition-all duration-200 relative hover:ring-primary",
                    isSelected && "text-white ring-primary"
                  )}
                  onClick={() => handleTableSelect(table)}
                >
                  {/* <div className="relative group cursor-pointer"> */}
                  {/* Chairs */}
                  {/* {chairPositions.map((chairPos, index) => (
                      <div
                        key={index}
                        className={cn(
                          "absolute w-2 h-2 rounded-sm",
                          table.isOccupied
                            ? "bg-muted-foreground/40"
                            : "bg-green-500"
                        )}
                        style={{
                          left: chairPos.x,
                          top: chairPos.y,
                        }}
                      />
                    ))} */}

                  {/* Table */}
                  <Card
                    className={cn(
                      "flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md rounded-lg truncate whitespace-pre-wrap",
                      table.isOccupied
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-green-100 text-green-700 border border-green-300"
                    )}
                    // style={{
                    //   width: `${tableSize.width}px`,
                    //   height: `${tableSize.height}px`,
                    // }}
                  >
                    <span className="font-medium text-xs text-center text-balance">
                      {table.tableName}
                    </span>
                  </Card>
                  {/* </div> */}
                </div>
              </TableDetails>
            );
          })}
          {isPageChanging &&
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-center">
                <Card className="flex items-center justify-center h-20 w-20 bg-muted text-muted-foreground animate-pulse"></Card>
              </div>
            ))}
        </div>
      ) : (
        <Card className="@container/card">
          <CardFooter className="flex-col gap-4 text-sm flex justify-center">
            <div className="line-clamp-1 flex gap-2 font-medium text-center text-balance">
              This restaurant has no tables yet.
            </div>
            {user?.role === "owner" && (
              <CreateTableDialog
                isLoading={isPageLoading}
                restaurantSlug={slug}
                setAllTables={setAllTables}
              >
                Create a New Table
              </CreateTableDialog>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
