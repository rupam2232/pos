import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { FileRejection, useDropzone } from "react-dropzone";
import { ScrollArea } from "@repo/ui/components/scroll-area";
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
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { createRestaurantSchema } from "@/schemas/restaurantSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import axios from "@/utils/axiosInstance";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiResponse } from "@repo/ui/types/ApiResponse";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import type { RestaurantMinimalInfo } from "@repo/ui/types/Restaurant";
import { addRestaurant } from "@/store/restaurantSlice";

const CreateRestaurantDialog = ({
  children = "Create a New Restaurant",
  isLoading = false,
  setOwnersRestaurant,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  setOwnersRestaurant: React.Dispatch<
    React.SetStateAction<RestaurantMinimalInfo[]>
  >;
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageErrorMessage, setImageErrorMessage] = useState<string>("");
  const [formLoading, setformLoading] = useState<boolean>(false);
  const [slug, setSlug] = useState<string>("");
  const [isSlugUnique, setIsSlugUnique] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState<boolean>(false);
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const debounced = useDebounceCallback(setSlug, 300);
  const closeDialog = useRef<HTMLButtonElement>(null);
  const form = useForm<z.infer<typeof createRestaurantSchema>>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: {
      restaurantName: "",
      slug: "",
      description: "",
      address: "",
      logoUrl: undefined,
    },
  });

  const logoUrl = useWatch({
    control: form.control,
    name: "logoUrl",
  });

  const checkUsernameUnique = useCallback(async () => {
    setIsSlugUnique(null);
    if (isCheckingSlug) return; // Prevent multiple requests
    if (!slug) return; // Skip if slug is empty
    form.trigger("slug"); // Ensure slug is validated before checking uniqueness
    if (slug.length > 2) {
      setIsCheckingSlug(true);
      setIsSlugUnique(null);
      try {
        const response = await axios.get(`/restaurant/${slug}/is-unique-slug`);
        if (!response.data.data) {
          form.setError("slug", {
            type: "validate",
            message: "Slug is already taken",
          });
        } else {
          setIsSlugUnique(true);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error checking slug uniqueness:", axiosError);
        if (axiosError.response?.status === 401) {
          dispatch(signOut());
          router.push("/signin");
        }
      } finally {
        setIsCheckingSlug(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    checkUsernameUnique();
  }, [slug, checkUsernameUnique]);

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

  const onSubmit = async (data: z.infer<typeof createRestaurantSchema>) => {
    if (isLoading || formLoading) return; // Prevent multiple submissions
    if (!user || user?.role !== "owner") {
      toast.error("You do not have permission to create a restaurant");
      return;
    }
    await checkUsernameUnique(); // Ensure slug uniqueness check is done
    // Block submission if slug is not unique or check is in progress
    if (isSlugUnique !== true) {
      form.setError("slug", {
        type: "validate",
        message: "Slug is already taken",
      });
      return;
    }
    if (isCheckingSlug) {
      toast.error("Please wait until slug uniqueness is checked");
      return;
    }
    try {
      setformLoading(true);
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
      dispatch(
        addRestaurant({
          _id: response.data.data._id,
          restaurantName: response.data.data.restaurantName,
          slug: response.data.data.slug,
        })
      );
      form.reset();
      setImageFile(null);
      if (closeDialog.current) {
        closeDialog.current.click();
      }
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

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (logoUrl) {
        handleImageRemove();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoUrl]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open && logoUrl) {
          handleImageRemove();
        }
      }}
    >
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <ScrollArea className="overflow-y-auto max-h-[90vh]">
          <DialogHeader className="p-6">
            <DialogTitle className="mb-4">Create a New Restaurant</DialogTitle>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  {(imageFile || logoUrl) && (
                    <div className="group relative mx-auto rounded-full cursor-pointer">
                      <Tooltip>
                        <TooltipTrigger className="cursor-pointer" asChild>
                          <div>
                            <Avatar className="w-30 h-30 rounded-full">
                              <AvatarImage
                                src={
                                  logoUrl
                                    ? logoUrl
                                    : URL.createObjectURL(imageFile!)
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
                    <input {...getInputProps()} name="logoUrl" />
                    <Button
                      type="button"
                      className="bg-transparent hover:bg-transparent text-primary/50 group-hover:text-primary"
                    >
                      <ImagePlusIcon />
                      Select Logo
                    </Button>
                  </div>
                  {imageErrorMessage && (
                    <p className="text-red-500 mb-2">{imageErrorMessage}</p>
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
                        <FormDescription>
                          The name of your restaurant. It will be displayed on
                          your restaurant page.
                          <span className="text-muted-foreground block">
                            Note: All your created restaurant names must be
                            unique.
                          </span>
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
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
                          ) : isSlugUnique === true ? (
                            <p className="text-sm text-green-500">
                              Slug is available
                            </p>
                          ) : (
                            <FormMessage />
                          )
                        ) : (
                          <FormMessage />
                        )}
                        <FormDescription>
                          A unique identifier for your restaurant. It will be
                          used in the URL for your restaurant&apos;s page.
                        </FormDescription>
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
                        <FormDescription>
                          Optional description of your restaurant.
                        </FormDescription>
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
                        <FormDescription>
                          Optional address of your restaurant.
                        </FormDescription>
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
      <DialogClose ref={closeDialog}></DialogClose>
    </Dialog>
  );
};

export default CreateRestaurantDialog;
