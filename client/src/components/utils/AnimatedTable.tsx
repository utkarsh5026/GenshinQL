import React from "react";
import { motion } from "framer-motion";

interface AnimatedTableProps {
  children: React.ReactNode;
}
const AnimatedTable: React.FC<AnimatedTableProps> = ({ children }) => {
  return (
    <motion.div
      animate={{
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      }}
      initial={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTable;