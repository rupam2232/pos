"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";
import data from "./data.json";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import axios from "@/utils/axiosInstance";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiResponse } from "@repo/ui/types/ApiResponse";
import { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createRestaurantSchema } from "@/schemas/createRestaurantSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { FileRejection, useDropzone } from "react-dropzone";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import Image from "next/image";

export default function Page() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [ownersRestaurant, setOwnersRestaurant] = useState([]);
  const [staffsrestaurant, setStaffsRestaurant] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageErrorMessage, setImageErrorMessage] = useState("");
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

  const fetchOwnersRestaurants = async () => {
    try {
      const response = await axios.get("/restaurant/owner");
      if (response.data.success) {
        setOwnersRestaurant(response.data.data);
      } else {
        toast.error(
          response.data.message || "Failed to fetch owner's restaurants"
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch owner's restaurants"
      );
      console.error("Error fetching owner's restaurants:", error);
    }
  };

  const fetchStaffsRestaurant = async () => {
    try {
      const response = await axios.get("/restaurant/staff");
      if (response.data.success) {
        setStaffsRestaurant(response.data.data);
      } else {
        toast.error(
          response.data.message || "Failed to fetch staff's restaurants"
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch staff's restaurants"
      );
      console.error("Error fetching staff's restaurants:", error);
    }
  };

  useEffect(() => {
    if (user?.role === "owner") {
      fetchOwnersRestaurants();
    } else if (user?.role === "staff") {
      fetchStaffsRestaurant();
    }
  }, [user]);

  const form = useForm<z.infer<typeof createRestaurantSchema>>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: {
      restaurantName: "",
      slug: "",
      description: "",
      address: "",
      logoUrl: "",
    },
  });

  const onImageDrop = (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ) => {
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
    ];

    if (
      rejectedFiles.length > 0 ||
      (acceptedFiles.length > 0 &&
        (!acceptedFiles[0]?.type ||
          !allowedImageTypes.includes(acceptedFiles[0].type)))
    ) {
      setImageErrorMessage("Only .jpeg, .jpg, .png, .gif files are allowed.");
      return;
    }
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0] as File;
      if (file.size > MAX_IMAGE_SIZE) {
        setImageErrorMessage("Logo file size exceeds 2MB.");
        return;
      }
      setImageFile(file);
      setImageErrorMessage("");
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: {
        "image/jpeg": [],
        "image/png": [],
        "image/jpg": [],
        "image/gif": [],
      },
      multiple: false,
      onDrop: onImageDrop,
    });

  const onSubmit = async (data: z.infer<typeof createRestaurantSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/restaurant/create", data);
      toast.success(response.data.message || "Restaurant created successfully");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "An error occurred during restaurant creation"
      );
      console.error(
        axiosError.response?.data.message ||
          "An error occurred during restaurant creation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-col gap-2 px-4 lg:px-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome to your dashboard, {user?.firstName || "User"}!
                </p>
              </div>
              <div className="flex flex-col gap-4 px-4 lg:px-6">
                {user?.role === "owner" &&
                  (ownersRestaurant.length > 0 ? (
                    <Card className="@container/card">
                      <CardHeader>
                        <CardDescription>
                          Owner&apos;s Restaurants
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {ownersRestaurant.length}
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          Total Restaurants
                        </div>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card className="@container/card">
                      <CardFooter className="flex-col gap-4 text-sm flex justify-center">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          You have not created any restaurants yet.
                        </div>
                        <Dialog>
                          <DialogTrigger>Create a New Restaurant</DialogTrigger>
                          <DialogContent className="">
                            <ScrollArea className="overflow-y-auto max-h-[90vh]">
                              <DialogHeader className="p-6">
                                <DialogTitle className="mb-4">
                                  Create a New Restaurant
                                </DialogTitle>
                                <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <div className="grid gap-4">
                                      {imageFile && (
                                        <div className="mb-4">
                                          <Image
                                            src={URL.createObjectURL(imageFile)}
                                            alt="Restaurant Logo"
                                            width={200}
                                            height={200}
                                            unoptimized
                                            loading="lazy"
                                            draggable={false}
                                            className="w-38 h-38 object-cover rounded-full mx-auto"
                                          />
                                        </div>
                                      )}
                                      <div
                                        {...getRootProps()}
                                        className={`rounded-md p-6 ${imageFile && "hidden"} text-center cursor-pointer hover:bg-secondary/70 bg-secondary ${
                                          isDragActive
                                            ? `${!isDragReject ? "border-green-500" : "border-red-500"} border-2`
                                            : isDragReject
                                              ? "border-red-500 border-2"
                                              : "border-zinc-500 border-dashed border"
                                        }`}
                                      >
                                        <input
                                          {...getInputProps()}
                                          name="video"
                                        />
                                        <p className="mb-2 text-center">
                                          {isDragReject
                                            ? "Unsupported file type"
                                            : "Drag and drop an image file here to upload or click to select a file"}
                                        </p>
                                        <p className="text-sm text-primary/50">
                                          Supported formats: .jpeg, .jpg, .png,
                                          .gif
                                        </p>
                                        <Button type="button" className="mt-4">
                                          Select Logo
                                        </Button>
                                        {/* <Button type="button" className="mt-4">
                                          <ImagePlusIcon />Select Logo
                                        </Button> */}
                                      </div>
                                      {imageErrorMessage && (
                                        <p className="text-red-500 mb-2">
                                          {imageErrorMessage}
                                        </p>
                                      )}
                                      <FormField
                                        control={form.control}
                                        name="restaurantName"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel htmlFor="restaurant-name">
                                              Restaurant Name
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                id="restaurant-name"
                                                type="text"
                                                placeholder="E.g., Dominos"
                                                autoComplete="restaurant-name"
                                                required
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel htmlFor="slug">
                                              Slug
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                id="slug"
                                                type="text"
                                                placeholder="E.g., dominos"
                                                autoComplete="slug"
                                                required
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel htmlFor="description">
                                              Description (optional)
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                id="description"
                                                type="text"
                                                placeholder="E.g., Best pizza in town"
                                                autoComplete="description"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel htmlFor="address">
                                              Address (optional)
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                id="address"
                                                type="text"
                                                placeholder="E.g., 123 Pizza St, City"
                                                autoComplete="address"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                      >
                                        Create Restaurant
                                      </Button>
                                    </div>
                                  </form>
                                </Form>
                              </DialogHeader>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))}
                {user?.role === "staff" && (
                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Staff&apos;s Restaurant</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {staffsrestaurant.length}
                      </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Total Restaurants
                      </div>
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
      </SidebarInset>
    </SidebarProvider>
  );
}
