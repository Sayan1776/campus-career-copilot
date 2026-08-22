/**
 * Shared motion grammar — sheets settle onto the graph paper
 * with an exponential ease-out from an already-visible default.
 * One orchestrated entrance per view, never scattered effects.
 */

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const sheetRise = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

export const sheetStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

export const pageSettle = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, ease: EASE_OUT },
};
