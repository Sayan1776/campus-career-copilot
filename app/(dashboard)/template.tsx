'use client';

import { motion } from 'framer-motion';

/**
 * Route transitions — each sheet materialises onto the graph paper once per
 * navigation. The enter is a spring settle from slightly below; the exit is
 * implicit (the old tree is unmounted instantly when the new route mounts).
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(2px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.38,
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.28 },
        filter: { duration: 0.22 },
      }}
    >
      {children}
    </motion.div>
  );
}
