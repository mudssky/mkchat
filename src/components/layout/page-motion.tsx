"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageMotionProps {
  children: ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * 页面进入动效容器，负责统一首屏过渡与子元素交错。
 * @param {PageMotionProps} props - 组件属性。
 * @param {ReactNode} props.children - 页面内容。
 * @returns {JSX.Element} 动效容器。
 */
export function PageMotion({ children }: PageMotionProps) {
  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>
      {children}
    </motion.div>
  );
}

interface MotionItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * 动效子项容器，配合 PageMotion 做分步进入。
 * @param {MotionItemProps} props - 组件属性。
 * @param {ReactNode} props.children - 子元素内容。
 * @param {string | undefined} props.className - 额外样式类名。
 * @returns {JSX.Element} 动效子项容器。
 */
export function MotionItem({ children, className }: MotionItemProps) {
  return (
    <motion.div variants={itemVariants} className={cn(className)}>
      {children}
    </motion.div>
  );
}
