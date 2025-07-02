"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";
import data from "./data.json";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import axios from "@/utils/axiosInstance";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiResponse } from "@repo/ui/types/ApiResponse";
import { useCallback, useEffect, useRef, useState } from "react";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { useForm, useWatch } from "react-hook-form";
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
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@repo/ui/components/avatar";
import { ImagePlusIcon, Loader2, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useDebounceCallback } from "usehooks-ts";

export type Restaurant = {
  _id: string;
  restaurantName: string;
  slug: string;
  description?: string;
  address?: string;
  logoUrl?: string;
  isCurrentlyOpen?: boolean;
};

export default function Page() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [ownersRestaurant, setOwnersRestaurant] = useState<Restaurant[]>([]);
  const [staffsrestaurant, setStaffsRestaurant] = useState<Restaurant | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageErrorMessage, setImageErrorMessage] = useState<string>("");
  const [formLoading, setformLoading] = useState<boolean>(false);
  const [slug, setSlug] = useState<string>("");
  const [isSlugUnqiue, setIsSlugUnique] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState<boolean>(false);
  const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const debounced = useDebounceCallback(setSlug, 300);
  const closeDialog = useRef<HTMLButtonElement>(null);

  const fetchOwnersRestaurants = useCallback(async () => {
    setIsLoading(true);
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
    }
  }, [user, fetchOwnersRestaurants, fetchStaffsRestaurant]);

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

  const logoUrl = useWatch({
    control: form.control,
    name: "logoUrl",
  });

  const checkUsernameUnique = useCallback(async () => {
    if (isCheckingSlug) return; // Prevent multiple requests
    if (slug.length > 0) {
      form.trigger("slug"); // Ensure slug is validated before checking uniqueness
      if (form.formState.isSubmitting) return; // Prevent checking during form submission
      if (form.getFieldState("slug").invalid) return; // Prevent checking if slug is invalid
      setIsCheckingSlug(true);
      setIsSlugUnique(null);
      try {
        const response = await axios.get(`/restaurant/${slug}/is-unique-slug`);
        // setIsSlugUnique(response.data.data);
        if (!response.data.data) {
          form.setError("slug", {
            type: "manual",
            message: "Slug is already taken",
          });
        } else {
          setIsSlugUnique(true);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error checking slug uniqueness:", axiosError);
      } finally {
        setIsCheckingSlug(false);
      }
    }
  }, [slug, isCheckingSlug, form]);

  useEffect(() => {
    checkUsernameUnique();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleImageRemove = async () => {
    setImageErrorMessage("");
    if (logoUrl) {
      // If logoUrl is set, remove the image from the server
      const mediaUrl = logoUrl;
      form.setValue("logoUrl", "");
      setImageFile(null);
      try {
        const response = await axios.delete("/media/restaurant-logo", {
          data: {
            mediaUrl,
          },
        });
        if (!response.data.success) {
          toast.error(response.data.message || "Failed to remove logo");
        }
      } catch (error) {
        console.error("Error removing image:", error);
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message || "Failed to remove logo"
        );
        if (axiosError.response?.status === 401) {
          dispatch(signOut());
          router.push("/signin");
        }
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const response = await axios.post(
        "/media/restaurant-logo",
        { restaurantLogo: file },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      form.setValue("logoUrl", response.data.data);
    } catch (error) {
      console.error("Error uploading image:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || "Failed to upload image"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    }
  };

  const onImageDrop = (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ) => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (
      rejectedFiles.length > 0 ||
      (acceptedFiles.length > 0 &&
        (!acceptedFiles[0]?.type ||
          !allowedImageTypes.includes(acceptedFiles[0].type)))
    ) {
      setImageErrorMessage("Only .jpeg, .jpg, .png files are allowed.");
      return;
    }
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0] as File;
      if (file.size > MAX_IMAGE_SIZE) {
        setImageErrorMessage("Logo file size exceeds 3MB.");
        return;
      }
      handleImageUpload(file);
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
    if (isLoading || formLoading) return; // Prevent multiple submissions
    if (!user || user?.role !== "owner") {
      toast.error("You do not have permission to create a restaurant");
      return;
    }
    try {
      setformLoading(true);
      if (closeDialog.current) {
        closeDialog.current.click();
        return;
      }
      const response = await axios.post("/restaurant/create", data);
      if (
        !response.data.success ||
        !response.data.data ||
        !Array.isArray(response.data.data) ||
        response.data.data.length === 0
      ) {
        toast.error(response.data.message || "Failed to create restaurant");
        return;
      }
      setOwnersRestaurant((prev) => [...prev, response.data.data]);
      form.reset();
      setImageFile(null);
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
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin");
      }
    } finally {
      setformLoading(false);
    }
  };
  // console.log(closeDialog);
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
                        <div className="line-clamp-1 flex gap-2 font-medium text-center text-balance">
                          You have not created any restaurants yet.
                        </div>
                        <Dialog>
                          <DialogTrigger>Create a New Restaurant</DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <ScrollArea className="overflow-y-auto max-h-[90vh]">
                              <DialogHeader className="p-6">
                                <DialogTitle className="mb-4">
                                  Create a New Restaurant
                                </DialogTitle>
                                <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <div className="grid gap-4">
                                      {(imageFile || logoUrl) && (
                                        <div className="group relative mx-auto rounded-full cursor-pointer">
                                          <Tooltip>
                                            <TooltipTrigger
                                              className="cursor-pointer"
                                              asChild
                                            >
                                              <div>
                                                <Avatar className="w-30 h-30 rounded-full">
                                                  <AvatarImage
                                                    src={
                                                      logoUrl
                                                        ? logoUrl
                                                        : URL.createObjectURL(
                                                            imageFile!
                                                          )
                                                    }
                                                    alt="Restaurant Logo"
                                                    className="object-cover"
                                                    loading="lazy"
                                                    draggable={false}
                                                  />
                                                </Avatar>
                                                <Button
                                                  type="button"
                                                  className="bg-black/50 text-primary/50 group-hover:text-primary hidden group-hover:flex absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full w-full h-full items-center justify-center hover:bg-black/50"
                                                  onClick={handleImageRemove}
                                                  aria-label="Remove Logo"
                                                >
                                                  <Trash2 className="size-6 text-red-600" />
                                                </Button>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="text-sm font-semibold">
                                                Click to remove the logo
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </div>
                                      )}
                                      <div
                                        {...getRootProps()}
                                        className={`group rounded-full w-30 h-30 mx-auto ${imageFile && "hidden"} text-center cursor-pointer hover:bg-secondary/70 bg-secondary flex items-center justify-center ${
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
                                        <Button
                                          type="button"
                                          className="bg-transparent hover:bg-transparent text-primary/50 group-hover:text-primary"
                                        >
                                          <ImagePlusIcon />
                                          Select Logo
                                        </Button>
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
                                                onChange={(e) => {
                                                  field.onChange(e);
                                                  debounced(e.target.value);
                                                }}
                                              />
                                            </FormControl>
                                            {form.getValues("slug") ? (
                                              isCheckingSlug ? (
                                                <p className="text-sm text-muted-foreground">
                                                  Checking slug uniqueness...
                                                </p>
                                              ) : isSlugUnqiue === true ? (
                                                <p className="text-sm text-green-500">
                                                  Slug is available
                                                </p>
                                              ) : (
                                                <FormMessage />
                                              )
                                            ) : (
                                              <FormMessage />
                                            )}
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
                                        disabled={isLoading || formLoading}
                                      >
                                        {formLoading ? (
                                          <>
                                            <Loader2 className="animate-spin" />
                                            Creating...
                                          </>
                                        ) : (
                                          "Create Restaurant"
                                        )}
                                      </Button>
                                    </div>
                                  </form>
                                </Form>
                              </DialogHeader>
                            </ScrollArea>
                          </DialogContent>
                          <DialogClose
                            ref={closeDialog}
                          ></DialogClose>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))}
                {user?.role === "staff" && (
                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Staff&apos;s Restaurant</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        1
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
