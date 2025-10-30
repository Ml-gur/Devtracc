import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  FolderOpen, 
  Users, 
  MessageCircle, 
  BarChart3, 
  Star, 
  CheckCircle, 
  Code2, 
  Globe, 
  Zap,
  Shield,
  Clock,
  Target,
  Layers,
  Rocket
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomepageProps {
  onEnterPlatform: () => void;
}

export default function Homepage({ onEnterPlatform }: HomepageProps) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const features = [
    {
      icon: FolderOpen,
      title: "Project Management",
      description: "Comprehensive Kanban boards with drag-and-drop functionality, automatic task timers, and progress tracking"
    },
    {
      icon: Users,
      title: "Community Collaboration", 
      description: "Connect with African developers, share projects, collaborate, and build together as a community"
    },
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description: "Seamless communication with real-time messaging, collaboration analytics, and notification system"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Track your development journey with comprehensive analytics, insights, and productivity metrics"
    },
    {
      icon: Star,
      title: "Project Showcase",
      description: "Display your work to the community with project galleries, social interactions, and portfolio building"
    },
    {
      icon: Shield,
      title: "Offline-First",
      description: "Work anywhere with local storage support and automatic sync when you're back online"
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Built for African Developers",
      description: "Designed specifically for the unique needs and challenges of the African tech ecosystem"
    },
    {
      icon: Zap,
      title: "No Barriers to Entry",
      description: "Access the platform immediately without authentication barriers - start building right away"
    },
    {
      icon: Globe,
      title: "Community-Driven",
      description: "Connect, collaborate, and grow with fellow developers across the African continent"
    }
  ];

  const stats = [
    { label: "Active Developers", value: "10,000+", icon: Users },
    { label: "Projects Tracked", value: "50,000+", icon: FolderOpen },
    { label: "Collaborations", value: "25,000+", icon: MessageCircle },
    { label: "African Countries", value: "54", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden min-h-screen flex items-center">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-green-600/5" 
          style={{ y: backgroundY }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              style={{ y: textY }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Badge variant="secondary" className="w-fit">
                    🚀 Version 1.0 - Production Ready
                  </Badge>
                </motion.div>
                <motion.h1 
                  className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  DevTrack
                  <motion.span 
                    className="text-green-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    {" "}Africa
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="text-xl text-gray-600 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  The complete project management and collaboration platform designed specifically for African developers to showcase their journey, track projects, and build communities.
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={onEnterPlatform}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Enter Platform
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg border-gray-300 transition-all duration-300 hover:shadow-lg"
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Learn More
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex items-center space-x-6 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                {[
                  { text: "Instant Dashboard Access", delay: 0 },
                  { text: "Works Offline", delay: 0.1 },
                  { text: "Demo Available", delay: 0.2 }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 + item.delay }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1710770563074-6d9cc0d3e338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZGV2ZWxvcGVycyUyMGNvZGluZyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU2MzU0NjEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="African developers coding"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="h-5 w-5 text-green-600" />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-gray-900">Ready to Launch</div>
                    <div className="text-sm text-gray-500">Start building immediately</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Features Section */}
      <FeaturesSection features={features} />

      {/* Benefits Section */}
      <BenefitsSection benefits={benefits} />

      {/* Technology Stack Section */}
      <TechStackSection />

      {/* CTA Section */}
      <CTASection onEnterPlatform={onEnterPlatform} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">DevTrack Africa</h3>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Empowering African developers with comprehensive project management and collaboration tools designed specifically for our unique ecosystem.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Project Management</li>
                <li>Community Features</li>
                <li>Real-time Messaging</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Offline-First Design</li>
                <li>No Registration Required</li>
                <li>Collaboration Tools</li>
                <li>Project Showcase</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DevTrack Africa. Built for African developers, by African developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Animated section components
function StatsSection({ stats }: { stats: any[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div 
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </motion.div>
              <motion.div 
                className="text-3xl font-bold text-gray-900"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ features }: { features: any[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Track Your Development Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From project management to community collaboration, DevTrack Africa provides all the tools you need to showcase your skills and connect with fellow developers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </motion.div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection({ benefits }: { benefits: any[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Built for the African Tech Ecosystem
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                DevTrack Africa understands the unique challenges and opportunities in the African tech landscape. Our platform is designed to empower developers across the continent to build, collaborate, and showcase their work.
              </p>
            </div>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="flex space-x-4"
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <motion.div 
                    className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <benefit.icon className="h-5 w-5 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <motion.div 
                  className="bg-blue-100 rounded-2xl p-6 h-32"
                  whileHover={{ scale: 1.05 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-3">
                    <Layers className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-semibold text-blue-900">Project Tracking</div>
                      <div className="text-sm text-blue-700">Kanban Boards</div>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="bg-green-100 rounded-2xl p-6 h-40"
                  whileHover={{ scale: 1.05 }}
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-900">Real-time</div>
                      <div className="text-sm text-green-700">Collaboration</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <motion.div 
                      className="w-full bg-green-200 rounded h-2"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "100%" } : {}}
                      transition={{ duration: 1, delay: 1 }}
                    />
                    <motion.div 
                      className="w-3/4 bg-green-200 rounded h-2"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "75%" } : {}}
                      transition={{ duration: 1, delay: 1.3 }}
                    />
                  </div>
                </motion.div>
              </div>
              <div className="space-y-4 pt-8">
                <motion.div 
                  className="bg-purple-100 rounded-2xl p-6 h-40"
                  whileHover={{ scale: 1.05 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                    <div>
                      <div className="font-semibold text-purple-900">Analytics</div>
                      <div className="text-sm text-purple-700">Insights</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <motion.div 
                      className="w-full bg-purple-200 rounded h-2"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "100%" } : {}}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                    <motion.div 
                      className="w-2/3 bg-purple-200 rounded h-2"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "66%" } : {}}
                      transition={{ duration: 1, delay: 1 }}
                    />
                    <motion.div 
                      className="w-4/5 bg-purple-200 rounded h-2"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "80%" } : {}}
                      transition={{ duration: 1, delay: 1.3 }}
                    />
                  </div>
                </motion.div>
                <motion.div 
                  className="bg-yellow-100 rounded-2xl p-6 h-32"
                  whileHover={{ scale: 1.05 }}
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <div className="flex items-center space-x-3">
                    <Star className="h-6 w-6 text-yellow-600" />
                    <div>
                      <div className="font-semibold text-yellow-900">Showcase</div>
                      <div className="text-sm text-yellow-700">Portfolio</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TechStackSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Built with Modern Technology
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            DevTrack Africa is built using cutting-edge technologies to ensure reliability, performance, and scalability.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection({ onEnterPlatform }: { onEnterPlatform: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-r from-blue-600 to-green-600 relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 opacity-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-white rounded-full" />
      </motion.div>
      
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2 
          className="text-3xl lg:text-4xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Ready to Start Your Development Journey?
        </motion.h2>
        <motion.p 
          className="text-xl text-blue-100 mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Join thousands of African developers who are already using DevTrack Africa to manage their projects, collaborate with peers, and showcase their work to the world.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={onEnterPlatform}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Now
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-8 flex items-center justify-center space-x-6 text-blue-100 text-sm"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {["100% Free", "No Setup Required", "Start Immediately"].map((text, index) => (
            <motion.div 
              key={index}
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
            >
              <CheckCircle className="h-4 w-4" />
              <span>{text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}