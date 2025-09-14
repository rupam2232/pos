"use client";
import { Button } from "@repo/ui/components/button";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/40 via-background to-background"></div>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
      >
        Modern POS for Restaurants
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg md:text-xl max-w-2xl mb-8"
      >
        Simplify orders, manage tables, and accept payments — all powered by QR codes.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-4"
      >
        <Button className="font-medium py-5">
          Get Started Free
        </Button>
        <Button className="font-medium py-5" variant="outline">
          Book a Demo
        </Button>
      </motion.div>
    </section>
  );
}
