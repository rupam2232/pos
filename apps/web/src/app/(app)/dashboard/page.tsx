"use client";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
// import { DataTable } from "@/components/data-table";
// import { SectionCards } from "@/components/section-cards";
// import data from "./data.json";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import axios from "@/utils/axiosInstance";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiResponse } from "@repo/ui/types/ApiResponse";
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@repo/ui/components/avatar";
import type { RestaurantMinimalInfo } from "@repo/ui/types/Restaurant";
import CreateRestaurantDialog from "@/components/create-restaurant-dialog";
// import { Separator } from "@repo/ui/components/separator";

export default function Page() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ownersRestaurant, setOwnersRestaurant] = useState<
    RestaurantMinimalInfo[]
  >([]);
  const [staffsrestaurant, setStaffsRestaurant] =
    useState<RestaurantMinimalInfo | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const fetchOwnersRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/restaurant/owner");
      if (response.data.success) {
        setOwnersRestaurant(response.data.data);
        setStaffsRestaurant(null);
      } else {
        toast.error(
          response.data.message || "Failed to fetch owner's restaurants"
        );
      }
    } catch (error) {
      console.error("Error fetching owner's restaurants:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch owner's restaurants"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, router]);

  const fetchStaffsRestaurant = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/restaurant/staff");
      if (response.data.success) {
        setStaffsRestaurant(response.data.data);
        setOwnersRestaurant([]);
      } else {
        toast.error(
          response.data.message || "Failed to fetch staff's restaurants"
        );
      }
    } catch (error) {
      console.error("Error fetching staff's restaurants:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch staff's restaurants"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (user?.role === "owner") {
      fetchOwnersRestaurants();
    } else if (user?.role === "staff") {
      fetchStaffsRestaurant();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchOwnersRestaurants, fetchStaffsRestaurant]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to your dashboard, {user?.firstName || "User"}!
              </p>
            </div>
            {user?.role === "owner" && (
              <div className="px-4 lg:px-6">
                <CreateRestaurantDialog
                  setOwnersRestaurant={setOwnersRestaurant}
                  isLoading={isLoading}
                >
                  Create a New Restaurant
                </CreateRestaurantDialog>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 px-4 lg:px-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center text-center">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={`animate-pulse ${index > 0 ? `delay-${(index + 1) * 100}` : ""} h-52 border border-accent shadow-md rounded-md flex flex-col items-center justify-between p-4`}
                  >
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="animate-pulse bg-accent h-6 w-full rounded-md"></div>
                      <div className="animate-pulse bg-accent h-4 w-4/5 rounded-md"></div>
                    </div>
                    <div className="animate-pulse bg-accent h-15 w-15 rounded-full"></div>
                    <div className="animate-pulse bg-accent h-8 w-2/3 rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : user?.role === "owner" ? (
              ownersRestaurant.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center text-center">
                  {ownersRestaurant.map((restaurant) => (
                    <Card key={restaurant._id} className="@container/card">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl line-clamp-2">
                          {restaurant.restaurantName}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {restaurant.description}
                        </CardDescription>
                      </CardHeader>
                      <CardAction className="flex flex-col items-center justify-center w-full gap-4">
                        <div className="flex items-center gap-2">
                          {restaurant.logoUrl ? (
                            <Avatar className="w-15 h-15">
                              <AvatarImage
                                src={restaurant.logoUrl}
                                alt="Restaurant Logo"
                                className="object-cover"
                                loading="lazy"
                                draggable={false}
                              />
                            </Avatar>
                          ) : (
                            <Avatar className="w-15 h-15 bg-secondary">
                              <Image
                                src="/placeholder-logo.png"
                                alt="Placeholder Logo"
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </Avatar>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/restaurant/${restaurant.slug}`
                            )
                          }
                        >
                          View Restaurant
                        </Button>
                      </CardAction>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="@container/card">
                  <CardFooter className="flex-col gap-4 text-sm flex justify-center">
                    <div className="line-clamp-1 flex gap-2 font-medium text-center text-balance">
                      You have not created any restaurants yet.
                    </div>
                    <CreateRestaurantDialog
                      setOwnersRestaurant={setOwnersRestaurant}
                      isLoading={isLoading}
                    >
                      Create a New Restaurant
                    </CreateRestaurantDialog>
                  </CardFooter>
                </Card>
              )
            ) : user?.role === "staff" && staffsrestaurant ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center text-center">
                <Card className="@container/card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl line-clamp-2">
                      {staffsrestaurant.restaurantName}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {staffsrestaurant.description}
                    </CardDescription>
                  </CardHeader>
                  <CardAction className="flex flex-col items-center justify-center w-full gap-4">
                    <div className="flex items-center gap-2">
                      {staffsrestaurant.logoUrl ? (
                        <Avatar className="w-15 h-15">
                          <AvatarImage
                            src={staffsrestaurant.logoUrl}
                            alt="Restaurant Logo"
                            className="object-cover"
                            loading="lazy"
                            draggable={false}
                          />
                        </Avatar>
                      ) : (
                        <Avatar className="w-15 h-15 bg-secondary">
                          <Image
                            src="/placeholder-logo.png"
                            alt="Placeholder Logo"
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </Avatar>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="text-sm"
                      onClick={() =>
                        router.push(
                          `/dashboard/restaurant/${staffsrestaurant.slug}`
                        )
                      }
                    >
                      View Restaurant
                    </Button>
                  </CardAction>
                </Card>
              </div>
            ) : (
              <Card className="@container/card">
                <CardFooter className="text-center block">
                  You are not assigned to any restaurant yet. Please contact
                  your manager or owner to get assigned to a restaurant.
                </CardFooter>
              </Card>
            )}
          </div>
        </div>

        {/* <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"> */}
        {/* Uncomment the SectionCards component if you want to display it */}
        {/* <SectionCards /> */}
        {/* {user?.role === "owner" && (
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
              )}
              <DataTable data={data} />
            </div> */}
      </div>
    </div>
  );
}
