import React from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Users, 
  Target, 
  Award, 
  Stethoscope, 
  Shield, 
  Clock, 
  Globe,
  Star,
  ArrowRight
} from "lucide-react";

const AboutUs = () => {
  const stats = [
    { number: "50+", label: "Hospitals Partnered", icon: Building },
    { number: "500+", label: "Medical Professionals", icon: Users },
    { number: "10K+", label: "Patients Served", icon: Heart },
    { number: "24/7", label: "Support Available", icon: Clock }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your health data is protected with enterprise-grade security and strict privacy controls."
    },
    {
      icon: Target,
      title: "Accessibility",
      description: "Making quality healthcare accessible to everyone, regardless of location or background."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Connecting patients, doctors, and hospitals in a seamless healthcare ecosystem."
    },
    {
      icon: Star,
      title: "Excellence",
      description: "Committed to delivering exceptional healthcare experiences through innovation and care."
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Medical Director",
      image: "SC",
      description: "Leading our medical standards and quality assurance."
    },
    {
      name: "Michael Rodriguez",
      role: "Technology Lead",
      image: "MR",
      description: "Driving innovation in healthcare technology solutions."
    },
    {
      name: "Dr. James Wilson",
      role: "Chief of Operations",
      image: "JW",
      description: "Ensuring seamless healthcare service delivery."
    },
    {
      name: "Lisa Park",
      role: "Patient Experience",
      image: "LP",
      description: "Dedicated to enhancing patient care and satisfaction."
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    whileInView: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">Care Link</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connecting patients with quality healthcare through innovative technology. 
              We're revolutionizing the way people access medical care across Sri Lanka.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
            >
              Learn More
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              {...fadeInUp}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="text-blue-600" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To democratize healthcare access by creating a seamless bridge between patients 
                and medical providers. We believe everyone deserves quality healthcare, 
                and we're committed to making that a reality through technology and innovation.
              </p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Globe className="text-green-600" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                A future where geographical and economic barriers no longer prevent anyone 
                from receiving the medical care they need. We envision a connected healthcare 
                ecosystem that serves every community with compassion and excellence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...staggerChildren}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  {...fadeInUp}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Icon className="text-white" size={28} />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Story</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Care Link was founded in 2020 by a team of healthcare professionals and technology 
                experts who recognized the growing need for accessible medical services in Sri Lanka. 
                Witnessing the challenges patients faced in finding reliable healthcare providers, 
                we set out to create a solution that would bridge this gap.
              </p>
              <p>
                What started as a simple platform to connect patients with nearby hospitals has 
                evolved into a comprehensive healthcare ecosystem. Today, we partner with leading 
                medical institutions across the country, offering everything from emergency care 
                coordination to specialized treatment programs.
              </p>
              <p>
                Our journey continues as we expand our services, integrate new technologies, 
                and work towards our vision of making quality healthcare accessible to all.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Care Link
            </p>
          </motion.div>

          <motion.div
            {...staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  {...fadeInUp}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dedicated professionals committed to transforming healthcare
            </p>
          </motion.div>

          <motion.div
            {...staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                {...fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {member.image}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Healthcare With Us?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of patients and healthcare providers who trust Care Link 
              for their medical needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Building icon component since it's used in stats
const Building = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

export default AboutUs;