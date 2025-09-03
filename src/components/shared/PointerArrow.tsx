import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface PointerArrowProps {
  className?: string;
  /**
   * Controls overall SVG size. The graphic is scalable; default fits nicely
   * alongside the hero calculator on desktop.
   */
  width?: number;
  height?: number;
}

/**
 * Decorative hand-drawn style arrow that can point toward a UI element.
 *
 * - Uses currentColor for stroke so parent classes can set brand color
 *   (e.g., `text-brand-yellow`).
 * - Subtle draw + wiggle animation, disabled when user prefers reduced motion.
 * - Marked aria-hidden because it's purely decorative.
 */
export function PointerArrow({
  className,
  width = 200,
  height = 120,
}: PointerArrowProps) {
  const prefersReduced = useReducedMotion();

  const draw = prefersReduced
    ? {}
    : ({
        pathLength: [0, 1],
        transition: { duration: 1.4, ease: "easeInOut" },
      } as const);

  const wiggle = prefersReduced
    ? {}
    : ({
        rotate: [-3, 3, -3],
        y: [0, -2, 0, 2, 0],
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
      } as const);

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <motion.g animate={wiggle as any} style={{ transformOrigin: "10% 60%" }}>
        {/* Wrigglier guide with two gentle loops */}
        <motion.path
          d="M10 95 C 35 80 25 52 55 52 C 75 52 70 70 88 74 C 106 78 116 60 136 62 C 145 63 148 60 150 60"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={draw as any}
        />
        {/* Arrow head */}
        <motion.path
          d="M150 60 L136 50 M150 60 L136 70"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={draw as any}
        />
      </motion.g>
    </motion.svg>
  );
}

export default PointerArrow;
