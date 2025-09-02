"use client";
import axios from "@/utils/axiosInstance";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import { ImagePlusIcon, Loader2 } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@repo/ui/components/alert-dialog";
import type { RootState, AppDispatch } from "@/store/store";
// import { setActiveRestaurant } from "@/store/restaurantSlice";
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "@repo/ui/components/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateRestaurantSchema } from "@/schemas/restaurantSchema";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { RestaurantFullInfo } from "@repo/ui/types/Restaurant";
import { TagsInput } from "@repo/ui/components/tags-input";
import { FileRejection, useDropzone } from "react-dropzone";

const ClientPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [restaurantData, setRestaurantData] = useState<RestaurantFullInfo>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageErrorMessage, setImageErrorMessage] = useState<string>("");

  const form = useForm<z.infer<typeof updateRestaurantSchema>>({
    resolver: zodResolver(updateRestaurantSchema),
    mode: "all",
    defaultValues: {
      restaurantName: "",
      newSlug: "",
      description: "",
      categories: [],
      address: "",
      openingTime: "",
      closingTime: "",
      logoUrl: undefined,
    },
  });

  const isReallyDirty = () => {
    const current = form.getValues();
    // Compare trimmed strings, and arrays as needed
    return (
      form.formState.defaultValues?.restaurantName?.trim() !==
        current.restaurantName.trim() ||
      form.formState.defaultValues?.newSlug?.trim() !==
        current.newSlug.trim() ||
      (form.formState.defaultValues?.description?.trim() || "") !==
        (current.description?.trim() || "") ||
      form.formState.defaultValues?.address?.trim() !==
        current.address?.trim() ||
      form.formState.defaultValues?.openingTime?.trim() !==
        current.openingTime?.trim() ||
      form.formState.defaultValues?.closingTime?.trim() !==
        current.closingTime?.trim() ||
      // Compare arrays (categories)
      JSON.stringify(form.formState.defaultValues?.categories) !==
        JSON.stringify(current.categories) ||
      form.formState.defaultValues?.logoUrl !== current.logoUrl
    );
  };

  const logoUrl = useWatch({
    control: form.control,
    name: "logoUrl",
  });

  const handleImageRemove = async () => {
    setImageErrorMessage("");
    if (logoUrl) {
      // If logoUrl is set, remove the image from the server
      const mediaUrl = logoUrl;
      form.setValue("logoUrl", undefined);
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
        setImageErrorMessage("Logo file size exceeds 1MB.");
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
      },
      multiple: false,
      maxSize: MAX_IMAGE_SIZE,
      onDrop: onImageDrop,
    });

  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const response = await axios.get(`/restaurant/${slug}`);

      if (response.data.success) {
        setRestaurantData(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(
        "Failed to fetch restaurant data. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch restaurant data. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin?redirect=/restaurant/" + slug + "/settings");
      }
    } finally {
      setIsPageLoading(false);
    }
  }, [slug, router, dispatch]);

  const onSubmit = async (data: z.infer<typeof updateRestaurantSchema>) => {
    if (form.formState.isSubmitting) return;
    if (isReallyDirty() === false) {
      toast.info("No changes made");
      return;
    }
    try {
      const response = await axios.patch(`/restaurant/${slug}`, data);

      if (response.data.success) {
        toast.success(
          response.data.message || "Restaurant updated successfully"
        );
        fetchDashboardStats();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(
        "Failed to update restaurant data. Please try again later:",
        error
      );
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Failed to update restaurant data. Please try again later"
      );
      if (axiosError.response?.status === 401) {
        dispatch(signOut());
        router.push("/signin?redirect=/restaurant/" + slug + "/settings");
      }
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [slug, fetchDashboardStats]);

  useEffect(() => {
    if (restaurantData) {
      form.reset({
        restaurantName: restaurantData.restaurantName ?? "",
        newSlug: restaurantData.slug ?? "",
        description: restaurantData.description ?? "",
        categories: restaurantData.categories ?? [],
        address: restaurantData.address ?? "",
        openingTime: restaurantData.openingTime ?? "",
        closingTime: restaurantData.closingTime ?? "",
        logoUrl: restaurantData.logoUrl ?? undefined,
      });
    }
  }, [restaurantData, form]);

  if (isPageLoading) {
    return (
      <div className="h-[95vh] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col px-6 py-4">
      <h1 className="text-2xl font-bold">Restaurant Settings</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        Manage your restaurant&apos;s settings and preferences.
      </p>
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit, (errors) =>
            console.log("Form errors:", errors)
          )}
        >
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
            <input {...getInputProps()} name="logoUrl" />
            <Button
              type="button"
              className="bg-transparent hover:bg-transparent text-foreground/50 group-hover:text-foreground shadow-none"
            >
              <ImagePlusIcon />
              Select Logo
            </Button>
          </div>
          <div className="lg:max-w-1/2 space-y-4">
            <FormField
              control={form.control}
              name="restaurantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="restaurantName">
                    Restaurant Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="restaurantName"
                      type="text"
                      placeholder="E.g., Dominos"
                      autoComplete="restaurant-name"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    The name of your restaurant. It will be displayed on your
                    restaurant page.
                    <span className="text-muted-foreground block">
                      Note: All your created restaurant names must be unique.
                    </span>
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="slug">Slug</FormLabel>
                  <FormControl>
                    <Input
                      id="slug"
                      type="text"
                      placeholder="E.g., dominos"
                      autoComplete="slug"
                      required
                      {...field}
                      //   onChange={(e) => {
                      //     field.onChange(e);
                      //     debounced(e.target.value);
                      //   }}
                    />
                  </FormControl>
                  {/* {form.getValues("slug") ? (
                    isCheckingSlug ? (
                      <p className="text-sm text-muted-foreground">
                        Checking slug uniqueness...
                      </p>
                    ) : isSlugUnique === true ? (
                      <p className="text-sm text-green-500">
                        Slug is available
                      </p>
                    ) : (
                      <FormMessage />
                    )
                  ) : (
                    <FormMessage />
                  )} */}
                  <FormDescription>
                    A unique identifier for your restaurant. It will be used in
                    the URL for your restaurant&apos;s page.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel htmlFor="description">
                      Description (optional)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Textarea
                      className="resize-none min-h-20 max-h-40"
                      id="description"
                      placeholder="E.g., Best pizza in town"
                      autoComplete="description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Optional, description of your restaurant.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="address">Address (optional)</FormLabel>
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
                  <FormDescription>
                    Optional, address of your restaurant.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="categories">
                    Categories (optional)
                  </FormLabel>
                  <FormControl>
                    <TagsInput
                      id="categories"
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={
                        field.value && field.value?.length > 0
                          ? "Add another category"
                          : "E.g., Italian, Pizza"
                      }
                      className="resize-none pb-4 whitespace-pre-wrap break-all"
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Optional categories for your restaurant. After adding a
                    category, press Enter to add another category.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="openingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="openingTime">
                    Opening Time (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="openingTime"
                      type="text"
                      placeholder="E.g., 9:00 AM"
                      autoComplete="openingTime"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* write in HH:MM format */}
                  <FormDescription>
                    Optional, opening time of your restaurant. Write in HH:MM
                    format
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="closingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="closingTime">
                    Closing Time (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="closingTime"
                      type="text"
                      placeholder="E.g., 11:00 PM"
                      autoComplete="closingTime"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Optional, closing time of your restaurant. Write in HH:MM
                    format
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ClientPage;
