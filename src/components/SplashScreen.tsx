import React from 'react';
import { motion } from 'motion/react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a] flex flex-col items-center justify-center z-[10000]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-32 h-32 mb-8"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 30px rgba(124,58,237,.4)",
              "0 0 60px rgba(124,58,237,.8)",
              "0 0 30px rgba(124,58,237,.4)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-full h-full rounded-full bg-gradient-to-br from-[#7c3aed] via-[#3b82f6] to-[#06b6d4] flex items-center justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-[#0a0a1a] flex items-center justify-center">
            <motion.div
              animate={{ 
                x: [0, 3, -2, 2, 0],
                y: [0, -2, 3, 2, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4]"
            />
          </div>
        </motion.div>
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-3xl font-black tracking-[0.2em] bg-gradient-to-r from-[#7c3aed] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent"
      >
        SIXIÈME SENS
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-[10px] text-[#6a6a99] mt-2 tracking-[0.4em] uppercase"
      >
        Intelligence Anticipative
      </motion.p>
      
      <div className="mt-12 w-48 h-[3px] bg-[#1a1a3e] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]"
        />
      </div>
    </div>
  );
};
