import type { Metadata } from "next";
import { RestaurantHeader } from "@/components/restaurant-header";
import { fetchRestaurantDetails } from "@/utils/fetchRestaurantDetails";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: "See what's available at this restaurant.",
};

export default async function RootLayout({
  children,
  modal,
  params,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const restaurant = await fetchRestaurantDetails(slug);
  if (!restaurant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-500">Restaurant not found.</p>
      </div>
    );
  }
  return (
    <>
      <RestaurantHeader restaurant={restaurant} />
      {children}
      {modal}
    </>
  );
}
