export type RestaurantMinimalInfo = {
  _id: string;
  restaurantName: string;
  slug: string;
  description?: string;
  address?: string;
  logoUrl?: string;
  isCurrentlyOpen?: boolean;
};

export type RestaurantFullInfo = RestaurantMinimalInfo & {
  openingTime?: string;
  closingTime?: string;
  taxRate: number;
  taxLabel?: string;
  isTaxIncludedInPrice: boolean;
  address?: string;
  categories?: string[];
};

export type RestaurantStaffData = {
  _id: string;
  restaurantName: string;
  slug: string;
  staffs: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    avatar: string;
  }[];
};
