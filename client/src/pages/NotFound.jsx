import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Result } from 'antd';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >
        <div className="relative mb-8">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              y: [0, -10, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              ease: "easeInOut" 
            }}
            className="inline-block"
          >
            <div className="w-32 h-32 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20">
              <Search className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
            </div>
          </motion.div>
          
          {/* Animated Orbitals */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -z-10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-400 rounded-full blur-sm" />
          </motion.div>
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -z-10"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full blur-sm" />
          </motion.div>
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2"
        >
          404
        </motion.h1>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-slate-800 dark:text-white mb-4"
        >
          Page Not Found
        </motion.h2>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed"
        >
          Oops! The page you're looking for seems to have vanished from our financial ledger. Let's get you back on track.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            type="primary" 
            size="large"
            icon={<Home size={18} />}
            onClick={() => navigate('/')}
            className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            Go Home
          </Button>
          <Button 
            size="large"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            className="h-12 px-8 rounded-xl dark:bg-slate-800 dark:text-white dark:border-slate-700 flex items-center justify-center gap-2"
          >
            Go Back
          </Button>
        </motion.div>

        {/* Decorative background elements */}
        <div className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none opacity-30 dark:opacity-20 overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-indigo-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[5%] w-64 h-64 bg-purple-400 rounded-full blur-[120px]" />
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
