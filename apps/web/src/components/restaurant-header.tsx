import Image from "next/image";
import { RestaurantMinimalInfo } from "@repo/ui/types/Restaurant";

export const RestaurantHeader = ({
  restaurant,
}: {
  restaurant: RestaurantMinimalInfo;
}) => (
  <header className="flex items-center p-6 gap-8">
    <Image
      src={restaurant.logoUrl || "/placeholder-logo.png"}
      alt={`${restaurant.restaurantName} logo`}
      width={72}
      height={72}
      draggable={false}
      priority
      className="w-18 h-18 object-cover rounded-full shadow"
    />
    <div>
      <h1 className="m-0 text-2xl font-bold">{restaurant.restaurantName}</h1>
      {restaurant.description && (
        <p className="mt-2">{restaurant.description}</p>
      )}
      {restaurant.isCurrentlyOpen === false && (
        <p className="mt-2 text-red-500">Currently closed</p>
      )}
    </div>
  </header>
);
