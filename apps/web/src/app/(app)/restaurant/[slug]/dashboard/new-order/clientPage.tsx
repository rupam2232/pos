"use client";
import { useState } from "react";
import FoodOrderStepsForStaffs from "@/components/food-order-steps-for-staffs";
import { useRouter, usePathname } from "next/navigation";

const ClientPage = () => {
  const [step, setStep] = useState<number>(1);
  const router = useRouter();
  const pathname = usePathname();

  function getDashboardUrl(path: string): string {
    return path.replace(/\/new-order\/?$/, "");
  }

  function handleDialogClose() {
    const dashboardUrl = getDashboardUrl(pathname);
    router.push(dashboardUrl);
  }

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto py-2">
      <h1 className="text-2xl font-bold mb-4 px-4">
        {step === 1
          ? "Select Table"
          : step === 2
            ? "Select Food Items"
            : "Confirm Order"}
      </h1>
      <FoodOrderStepsForStaffs
        step={step}
        setStep={setStep}
        footerClassName="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto"
        onClose={handleDialogClose}
      />
    </div>
  );
};

export default ClientPage;
