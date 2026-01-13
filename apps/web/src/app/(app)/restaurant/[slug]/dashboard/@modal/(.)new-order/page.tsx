"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import FoodOrderStepsForStaffs from "@/components/food-order-steps-for-staffs";

const Page = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<number>(1);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  
  function getDashboardUrl(path: string): string {
    return path.replace(/\/new-order\/?$/, "");
  }
  
  function handleDialogClose() {
    const dashboardUrl = getDashboardUrl(pathname);
    router.push(dashboardUrl);
  }

  return (
    <Dialog
      open={drawerOpen}
      onOpenChange={(open) => {
        setDrawerOpen(open);
        if (!open) {
          handleDialogClose();
        }
      }}
    >
      <DialogTrigger className="hidden">Open Dialog</DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-screen flex flex-col h-[90vh]">
        <DialogHeader>
          <DialogTitle className="pb-2! px-6 pt-6">
            {step === 1
              ? "Select Table"
              : step === 2
                ? "Select Food Items"
                : "Confirm Order"}
          </DialogTitle>
        </DialogHeader>
        <FoodOrderStepsForStaffs
          step={step}
          setStep={setStep}
          onClose={() => {
            setDrawerOpen(false); 
            handleDialogClose();
          }}
          className="flex-1 min-h-0"
        />
      </DialogContent>
    </Dialog>
  );
};

export default Page;
