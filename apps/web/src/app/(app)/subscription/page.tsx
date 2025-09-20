import type { Metadata } from "next";
import ClientPage from "./clientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Subscription - ${process.env.NEXT_PUBLIC_APP_NAME}`,
    description: `Manage your subscription plans.`,
  };
}

export default function page() {
  return <ClientPage />;
}
