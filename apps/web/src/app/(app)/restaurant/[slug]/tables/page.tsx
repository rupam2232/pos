"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Users, X, ArrowLeft } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import { useParams } from "next/navigation";

interface Table {
  _id: string;
  tableName: string;
  qrSlug: string;
  seatCount: number;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
}

const getTableSize = (chairs: number) => {
  if (chairs <= 1) return { width: 80, height: 60 };
  if (chairs <= 2) return { width: 90, height: 70 };
  if (chairs <= 4) return { width: 100, height: 80 };
  if (chairs <= 6) return { width: 110, height: 90 };
  if (chairs <= 8) return { width: 120, height: 100 };
  return { width: 100, height: 80 };
};

const getChairPositions = (
  chairs: number,
  tableSize: { width: number; height: number }
) => {
  const positions = [];
  const { width, height } = tableSize;
  const chairSize = 8;

  if (chairs === 1) {
    positions.push(
      { x: width / 2 - chairSize / 2, y: -chairSize - 2 } // top
    );
  } else if (chairs === 2) {
    positions.push(
      { x: width / 2 - chairSize / 2, y: -chairSize - 2 }, // top
      { x: width / 2 - chairSize / 2, y: height + 2 } // bottom
    );
  } else if (chairs === 4) {
    positions.push(
      { x: width / 2 - chairSize / 2, y: -chairSize - 2 }, // top
      { x: width / 2 - chairSize / 2, y: height + 2 }, // bottom
      { x: -chairSize - 2, y: height / 2 - chairSize / 2 }, // left
      { x: width + 2, y: height / 2 - chairSize / 2 } // right
    );
  } else if (chairs === 6) {
    positions.push(
      { x: width / 4 - chairSize / 2, y: -chairSize - 2 }, // top left
      { x: (3 * width) / 4 - chairSize / 2, y: -chairSize - 2 }, // top right
      { x: width / 4 - chairSize / 2, y: height + 2 }, // bottom left
      { x: (3 * width) / 4 - chairSize / 2, y: height + 2 }, // bottom right
      { x: -chairSize - 2, y: height / 2 - chairSize / 2 }, // left
      { x: width + 2, y: height / 2 - chairSize / 2 } // right
    );
  } else if (chairs === 8) {
    positions.push(
      { x: width / 4 - chairSize / 2, y: -chairSize - 2 }, // top left
      { x: (3 * width) / 4 - chairSize / 2, y: -chairSize - 2 }, // top right
      { x: width / 4 - chairSize / 2, y: height + 2 }, // bottom left
      { x: (3 * width) / 4 - chairSize / 2, y: height + 2 }, // bottom right
      { x: -chairSize - 2, y: height / 3 - chairSize / 2 }, // left top
      { x: -chairSize - 2, y: (2 * height) / 3 - chairSize / 2 }, // left bottom
      { x: width + 2, y: height / 3 - chairSize / 2 }, // right top
      { x: width + 2, y: (2 * height) / 3 - chairSize / 2 } // right bottom
    );
  } else if (chairs === 10) {
    positions.push(
      { x: width / 5 - chairSize / 2, y: -chairSize - 2 }, // top 1
      { x: (2 * width) / 5 - chairSize / 2, y: -chairSize - 2 }, // top 2
      { x: (3 * width) / 5 - chairSize / 2, y: -chairSize - 2 }, // top 3
      { x: (4 * width) / 5 - chairSize / 2, y: -chairSize - 2 }, // top 4
      { x: width / 5 - chairSize / 2, y: height + 2 }, // bottom 1
      { x: (2 * width) / 5 - chairSize / 2, y: height + 2 }, // bottom 2
      { x: (3 * width) / 5 - chairSize / 2, y: height + 2 }, // bottom 3
      { x: (4 * width) / 5 - chairSize / 2, y: height + 2 }, // bottom 4
      { x: -chairSize - 2, y: height / 2 - chairSize / 2 }, // left
      { x: width + 2, y: height / 2 - chairSize / 2 } // right
    );
  }

  return positions;
};

export default function SelectTable() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [guestCount] = useState(5);
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const dispatch = useDispatch();
  const router = useRouter();
  const [allTables, setAllTables] = useState<{
    tables: Table[];
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  } | null>(null);

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
  };

  const handleDeselectTable = () => {
    setSelectedTable(null);
  };

  const statusCounts = {
    available: allTables?.tables.filter((t) => !t.isOccupied).length,
    reserved: allTables?.tables.filter((t) => t.isOccupied).length,
  };

  const fetchAllTables = useCallback(async () => {
    try {
      const response = await axios.get(`/table/${slug}`);
      setAllTables(response.data.data);
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
    }
  }, [slug, router, dispatch]);

  useEffect(() => {
    fetchAllTables();
  }, [slug, fetchAllTables]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-medium text-foreground">Select Table</h1>
        </div>

        {/* Status Legend - Center */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted border"></div>
            <span className="text-muted-foreground">
              Available: {statusCounts.available}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">
              Reserved: {statusCounts.reserved}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto bg-background">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-y-12 p-4">
            {/* Tables positioned absolutely */}
            {allTables &&
              Array.isArray(allTables.tables) &&
              allTables.tables.length > 0 &&
              allTables.tables.map((table) => {
                const isSelected =
                  selectedTable?._id === table._id;
                const tableSize = getTableSize(table.seatCount);
                const chairPositions = getChairPositions(
                  table.seatCount,
                  tableSize
                );

                return (
                  <div
                    key={table._id}
                    className={cn(
                      "flex items-center justify-center py-4",
                      isSelected
                        ? "text-white border-2 border-green-400 rounded-md"
                        : ""
                    )}
                  >
                    <div className="relative group cursor-pointer">
                      {/* Chairs */}
                      {chairPositions.map((chairPos, index) => (
                        <div
                          key={index}
                          className={cn(
                            "absolute w-2 h-2 rounded-sm",
                            table.isOccupied ? "bg-red-500" : "bg-green-500"
                          )}
                          style={{
                            left: chairPos.x,
                            top: chairPos.y,
                          }}
                        />
                      ))}

                      {/* Table */}
                      <Card
                        className={cn(
                          "flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md rounded-lg",
                          table.isOccupied
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-foreground"
                        )}
                        style={{
                          width: `${tableSize.width}px`,
                          height: `${tableSize.height}px`,
                        }}
                        onClick={() => handleTableSelect(table)}
                      >
                        <span className="font-medium text-xs">
                          {table.tableName}
                        </span>
                      </Card>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="px-4 py-3 border-t border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {selectedTable && (
              <Card className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border-yellow-500/30">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-destructive/20 p-0"
                  onClick={handleDeselectTable}
                >
                  <X className="h-3 w-3" />
                </Button>
                <Users className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {guestCount} Guest
                </span>
              </Card>
            )}
          </div>

          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-6 py-2"
            disabled={!selectedTable}
          >
            Select Table
          </Button>
        </div>
      </div>
    </div>
  );
}
