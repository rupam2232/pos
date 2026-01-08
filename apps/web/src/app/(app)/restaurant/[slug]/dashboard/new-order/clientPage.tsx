"use client";
import { useState } from "react";
import FoodOrderStepsForStaffs from "@/components/food-order-steps-for-staffs";

const ClientPage = () => {
  const [step, setStep] = useState<number>(1);

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto py-2 relative">
      <h1 className="text-2xl font-bold mb-4 px-4">
        {step === 1
          ? "Select Table"
          : step === 2
            ? "Select Food Items"
            : "Confirm Order"}
      </h1>
      <FoodOrderStepsForStaffs step={step} setStep={setStep} />
    </div>
  );
};

export default ClientPage;
