import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Shield, Users, Zap, ArrowRight, Activity } from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
};

const Home = ({ onNavigateToLogin }) => {
  // Use custom colors: care-light, care-accent, care-primary, care-dark

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Diagnostics",
      description: "Leverage real-time data and intelligent tools to assist doctors in faster, more accurate decision-making.",
      color: 'text-care-primary',
      bg: 'bg-care-accent/50',
    },
    {
      icon: Shield,
      title: "Secure Patient Data",
      description: "Advanced encryption and role-based access control ensure the privacy and integrity of all medical records.",
      // Corrected to use branded colors
      color: 'text-care-dark',
      bg: 'bg-care-accent/70', 
    },
    {
      icon: Users,
      title: "Seamless Collaboration",
      description: "Connect doctors, patients, and providers on a single platform for efficient scheduling and communication.",
      // Corrected to use branded colors
      color: 'text-care-primary',
      bg: 'bg-care-accent/50', 
    },
  ];

  return (
    <div className="min-h-screen text-care-dark font-sans relative overflow-hidden bg-care-light">
      
      {/* --- Custom CSS for Animation (Global Background & Existing effects) --- */}
      <style>{`
        /* 1. Watercolor Background Animation (Simulated from Image) */
        @keyframes color-shift {
          0% { filter: hue-rotate(0deg) blur(50px) opacity(0.8); transform: scale(1); }
          50% { filter: hue-rotate(10deg) blur(40px) opacity(0.9); transform: scale(1.1); }
          100% { filter: hue-rotate(0deg) blur(50px) opacity(0.8); transform: scale(1); }
        }

        #animated-watercolor-bg {
          /* Using a mix of primary and accent colors to simulate the blue washes */
          background: linear-gradient(135deg, #D6E4F0, #1E56A0, #F6F6F6, #D6E4F0);
          background-size: 300% 300%;
          animation: color-shift 40s ease-in-out infinite;
          mix-blend-mode: multiply; /* Helps blend the color with the light background */
        }
        
        /* Hero Pulse Effect (Existing) */
        @keyframes pulse-bg {
          0% { box-shadow: 0 0 0 0 rgba(30, 86, 160, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(30, 86, 160, 0); }
          100% { box-shadow: 0 0 0 0 rgba(30, 86, 160, 0); }
        }
        .hero-pulse-effect {
          animation: pulse-bg 2.5s infinite cubic-bezier(0.66, 0.0, 0.34, 1);
        }

        /* Animated Gradient Button (Refined) */
        @keyframes shift-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .animated-gradient-button {
            /* Using care-primary and care-dark colors */
            background: linear-gradient(90deg, var(--care-primary) 0%, var(--care-dark) 50%, var(--care-primary) 100%);
            color: white; /* Text color is white */
            background-size: 200% 200%;
            transition: background-position 0.5s ease-out;
            border: none;
        }

        .animated-gradient-button:hover {
            background-position: -100% 50%;
        }

        /* Ensure Tailwind variables are set up */
        .animated-gradient-button {
          --care-primary: #1E56A0;
          --care-dark: #163172;
        }

        /* CSS for Data Flow Animation */
        @keyframes dash-flow {
            to { stroke-dashoffset: -100; }
        }
        .data-path {
            stroke: #1E56A0; /* care-primary */
            stroke-width: 2;
            stroke-dasharray: 10 10;
            animation: dash-flow 4s linear infinite;
        }
      `}</style>
      
      {/* Dynamic Background Element */}
      <div 
        id="animated-watercolor-bg" 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Main Content (Z-index ensures content is above the background) */}
      <main className="relative z-10 pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- 1. Hero Section --- */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center justify-between py-12 lg:py-24"
        >
          {/* Text Content */}
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <motion.p variants={itemVariants} className="text-xl font-medium text-care-primary mb-3">
              Future of Urban Healthcare
            </motion.p>
            <motion.h2 variants={itemVariants} className="text-5xl md:text-6xl font-extrabold leading-tight text-care-dark mb-6">
              Smart System for <br />
              <motion.span 
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-care-primary to-blue-400 drop-shadow-lg font-bold"
                initial={{ x: -10 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 50, delay: 0.5 }}
              >
                Seamless Care.
              </motion.span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8 max-w-lg">
              CARE-LINK connects every touchpoint from administration and doctors to patients and providers streamlining operations and enhancing clinical outcomes.
            </motion.p>
            
            {/* Animated Gradient Button */}
            <motion.button
              variants={itemVariants}
              onClick={onNavigateToLogin}
              whileHover={{ scale: 1.05, boxShadow: "0 15px 25px -5px rgba(30, 86, 160, 0.7)" }}
              whileTap={{ scale: 0.95 }}
              className="animated-gradient-button py-4 px-10 text-lg rounded-xl font-bold transition duration-300 shadow-xl flex items-center gap-3"
            >
              Get Started Now
            </motion.button>
          </div>
          
          {/* Animated Graphic Placeholder with Background Pulse (Updated with Data Flow) */}
          <motion.div 
            variants={itemVariants}
            // Add hidden on small screens, show only on large screens and up
            className="lg:w-1/2 relative p-6 bg-care-accent/50 rounded-3xl border-4 border-care-accent shadow-2xl hero-pulse-effect hidden lg:block"
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="w-full h-96 flex items-center justify-center bg-care-light rounded-2xl border-dashed border-2 border-care-primary/50 overflow-hidden relative">
                
                <div className="relative w-full h-full flex items-center justify-center">
                    
                    {/* SVG for connections and flow animation */}
                    <svg width="100%" height="100%" viewBox="0 0 400 350" className="absolute">
                        {/* Connection Lines (Paths) */}
                        <line x1="100" y1="100" x2="300" y2="100" className="data-path" />
                        <line x1="100" y1="100" x2="200" y2="250" className="data-path" />
                        <line x1="300" y1="100" x2="200" y2="250" className="data-path" />
                        
                        {/* Static Nodes (Circles) - Hidden behind labels */}
                        <circle cx="100" cy="100" r="10" fill="#1E56A0" />
                        <circle cx="300" cy="100" r="10" fill="#1E56A0" />
                        <circle cx="200" cy="250" r="10" fill="#1E56A0" />
                    </svg>

                    {/* Node Labels (Icons) - Aligned responsively */}
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="absolute flex flex-col items-center z-20 transform -translate-x-1/2 -translate-y-1/2" 
                        style={{ top: '10%', left: '20%' }}>
                        <Zap size={32} className="text-care-primary mb-1" />
                        <span className="text-xs font-bold text-care-dark text-center">AI Diagnostics</span>
                    </motion.div>

                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute flex flex-col items-center z-20 transform -translate-x-1/2 -translate-y-1/2" 
                        style={{ top: '10%', right: '20%' }}>
                        <Stethoscope size={32} className="text-care-primary mb-1" />
                        <span className="text-xs font-bold text-care-dark text-center">Doctor</span>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.0 }}
                        className="absolute flex flex-col items-center z-20 transform -translate-x-1/2 -translate-y-1/2" 
                        style={{ bottom: '10%', left: '44%' }}>
                        <Users size={32} className="text-care-primary mb-1" />
                        <span className="text-xs font-bold text-care-dark text-center">Patient Data</span>
                    </motion.div>
                </div>
            </div>
          </motion.div>

        </motion.section>

        {/* --- 2. Feature Cards Section --- */}
        <section className="py-20">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-center text-care-dark mb-12"
          >
            Why CARE-LINK?
          </motion.h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                // Feature card background: semi-transparent white/light to blend with the animated background
                className="p-8 rounded-2xl bg-care-light/90 shadow-xl hover:shadow-2xl transition duration-300 border border-care-accent/70"
                whileHover={{ y: -5 }}
              >
                <motion.div 
                    variants={iconVariants}
                    whileHover="hover"
                    className={`p-4 inline-flex rounded-xl mb-4 ${feature.bg}`}
                >
                  <feature.icon size={32} className={feature.color} />
                </motion.div>
                <h4 className="text-xl font-bold text-care-dark mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
        
        {/* --- 3. Footer/CTA --- */}
        <motion.footer 
          className="text-center py-16 bg-care-primary rounded-2xl my-12 shadow-2xl shadow-care-primary/30"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
            <h4 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Operations?</h4>
            <p className="text-care-accent text-lg mb-8">Join the platform trusted by urban healthcare leaders.</p>
            <motion.button
                onClick={onNavigateToLogin}
                whileHover={{ scale: 1.1, boxShadow: "0 15px 25px -5px rgba(30, 86, 160, 0.7)" }}
                whileTap={{ scale: 0.9 }}
                className="animated-gradient-button py-3 px-8 text-xl rounded-full font-bold transition duration-200 shadow-lg"
            >
                Secure Login
            </motion.button>
        </motion.footer>

      </main>
    </div>
  );
};

export default Home;
