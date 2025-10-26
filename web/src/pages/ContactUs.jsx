import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react'; // Relevant icons for contact

// Animation variants (copied from Home for consistency)
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
    rotate: -5, // Slight counter-rotate for icons
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
};

const ContactUs = () => {
  // Define contact information
  const contactDetails = [
    {
      icon: MapPin,
      label: "Our Office Address",
      value: "123 Health Lane, Colombo 07, Sri Lanka", // Replace with actual address
      color: 'text-care-primary',
      bg: 'bg-care-accent/50',
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: "+94 11 234 5678", // Replace with actual phone
      color: 'text-care-dark', // Using different colors for variety
      bg: 'bg-care-accent/70',
    },
    {
      icon: Mail,
      label: "Email Address",
      value: "info@carelink.lk", // Replace with actual email
      color: 'text-care-primary',
      bg: 'bg-care-accent/50',
    },
    {
      icon: Clock,
      label: "Operating Hours",
      value: "Mon - Fri: 8:00 AM - 6:00 PM", // Replace with actual hours
      color: 'text-care-dark',
      bg: 'bg-care-accent/70',
    },
  ];

  return (
    <div className="min-h-screen text-care-dark font-sans relative overflow-hidden bg-care-light">

      {/* --- Custom CSS for Background Animation (Copied from Home) --- */}
      <style>{`
        /* 1. Watercolor Background Animation */
        @keyframes color-shift {
          0% { filter: hue-rotate(0deg) blur(50px) opacity(0.8); transform: scale(1); }
          50% { filter: hue-rotate(10deg) blur(40px) opacity(0.9); transform: scale(1.1); }
          100% { filter: hue-rotate(0deg) blur(50px) opacity(0.8); transform: scale(1); }
        }

        #animated-watercolor-bg {
          background: linear-gradient(135deg, #D6E4F0, #1E56A0, #F6F6F6, #D6E4F0);
          background-size: 300% 300%;
          animation: color-shift 40s ease-in-out infinite;
          mix-blend-mode: multiply;
        }
      `}</style>

      {/* Dynamic Background Element */}
      <div
        id="animated-watercolor-bg"
        className="absolute inset-0 w-full h-full"
      />

      {/* Main Content (Z-index ensures content is above the background) */}
      <main className="relative z-10 pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- 1. Header Section --- */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center py-16 lg:py-24"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-extrabold leading-tight text-care-dark mb-4"
          >
            Get in Touch
            <motion.span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-care-primary to-blue-400 drop-shadow-lg font-bold mt-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 50, delay: 0.3 }}
            >
              Contact CARE LINK
            </motion.span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            We're here to help. Reach out to us through any of the methods below.
          </motion.p>
        </motion.section>

        {/* --- 2. Contact Details Section --- */}
        <section className="py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% is in view
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8" // Adjusted grid for 4 items
          >
            {contactDetails.map((detail, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                // Styling similar to feature cards but focused on contact info
                className="p-8 rounded-2xl bg-care-light/90 shadow-xl hover:shadow-2xl transition duration-300 border border-care-accent/70 flex items-start gap-6" // Use flex for icon alignment
                whileHover={{ y: -5 }}
              >
                {/* Icon */}
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className={`p-4 inline-flex rounded-xl mt-1 ${detail.bg}`} // Added mt-1 for alignment
                >
                  <detail.icon size={32} className={detail.color} />
                </motion.div>

                {/* Text Content */}
                <div>
                  <h4 className="text-xl font-bold text-care-dark mb-2">{detail.label}</h4>
                  <p className="text-gray-700 text-lg">{detail.value}</p>
                   {/* Add link for email/phone if desired */}
                   {detail.label === "Email Address" && (
                    <a href={`mailto:${detail.value}`} className="text-care-primary hover:underline mt-1 block">Send Email</a>
                   )}
                   {detail.label === "Phone Number" && (
                    <a href={`tel:${detail.value.replace(/\s/g, '')}`} className="text-care-primary hover:underline mt-1 block">Call Us</a>
                   )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* --- 3. Optional Map Placeholder --- */}
        <motion.section
          className="py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
           <h3 className="text-3xl font-bold text-center text-care-dark mb-8">Visit Us</h3>
           <div className="bg-care-light/90 rounded-2xl shadow-xl border border-care-accent/70 overflow-hidden h-96">
                {/* Placeholder - Replace with an actual map embed (e.g., Google Maps iframe) */}
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    [ Map Placeholder - Embed Map Here ]
                    {/* Example Google Maps Embed:
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.902348578657!2d79.8587138147721!3d6.902206995012543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x...%3AYourLocationName!5e0!3m2!1sen!2slk!4v..."
                        width="100%"
                        height="100%"
                        style={{ border:0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade">
                    </iframe>
                    */}
                </div>
           </div>
        </motion.section>

        {/* --- 4. Simple Footer --- */}
        <footer className="text-center py-8 text-gray-500 border-t border-care-accent/50 mt-12">
            © {new Date().getFullYear()} CARE LINK. All Rights Reserved. | Healthcare Management System, Sri Lanka.
        </footer>

      </main>
    </div>
  );
};

export default ContactUs;