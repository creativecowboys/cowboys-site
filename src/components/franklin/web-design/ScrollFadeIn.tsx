"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface ScrollFadeInProps {
  children: ReactNode;
}

export default function ScrollFadeIn({ children }: ScrollFadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
