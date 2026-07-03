import React from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/images/logo2.png';

const LoadingPage: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black fixed inset-0 z-50">
      <motion.img
        src={logo}
        alt="Logo"
        className="w-100 h-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <motion.div
        className="mt-8 w-16 h-1 bg-white rounded-full"
        initial={{ width: 0 }}
        animate={{ width: 300 }}
        transition={{ duration: 6, ease: 'easeInOut' }}
      />
    </div>
  );
};

export default LoadingPage;