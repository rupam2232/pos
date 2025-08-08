import type { Metadata } from "next";
import { fetchRestaurantDetails } from "@/utils/fetchRestaurantDetails";
import CheckoutClientPage from "./clientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await fetchRestaurantDetails(slug);
  return {
    title: `Checkout | ${restaurant.restaurantName}`,
    description: "Checkout your order.",
    icons: [
      {
        rel: "icon",
        url:
          restaurant.logoUrl?.replace("/upload/", "/upload/r_max/") ||
          `${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/favicon.ico`,
      },
    ],
  };
}

export default function page() {
  return <CheckoutClientPage />;
}
