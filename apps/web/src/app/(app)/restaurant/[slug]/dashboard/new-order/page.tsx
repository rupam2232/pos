import type { Metadata } from "next";
import ClientPage from "./clientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create New Order",
    description: "Create a new order.",
  };
}

export default function Page() {
  return <ClientPage />;
}
