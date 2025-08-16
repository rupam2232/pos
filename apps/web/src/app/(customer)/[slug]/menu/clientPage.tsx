"use client";

import { useParams, useSearchParams } from "next/navigation";
import ClientFoodMenu from "@/components/food-menu";

const MenuClientPage = () => {
  const searchParams = useSearchParams();
  const { slug } = useParams<{ slug: string }>();
  const tableId = searchParams.get("tableId");
  return (
    <ClientFoodMenu slug={slug} tableId={tableId} isStaffCreatingOrder={false} />
  );
}

export default MenuClientPage;