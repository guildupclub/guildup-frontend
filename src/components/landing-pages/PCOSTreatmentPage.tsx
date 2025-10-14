'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import Image from 'next/image';
import { 
  Star, 
  Users, 
  ArrowRight,
  Heart,
  CheckCircle2,
  Zap,
  Target,
  Lightbulb,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Expert {
  _id: string;
  name: string;
  image: string;
  bio: string;
  expertise: string[];
  experience: number;
  sessionsCount: number;
  min_offering_id?: string;
}

const SYMPTOMS = [
  { icon: Heart, title: 'Irregular Periods', description: 'Missed or unpredictable menstrual cycles' },
  { icon: Zap, title: 'Weight Gain', description: 'Difficulty losing weight, especially around the waist' },
  { icon: Target, title: 'Hair Issues', description: 'Excessive hair growth or hair loss' },
  { icon: Shield, title: 'Skin Problems', description: 'Acne, dark patches, or skin tags' },
  { icon: Clock, title: 'Fatigue', description: 'Constant tiredness and low energy' },
  { icon: Award, title: 'Mood Changes', description: 'Anxiety, depression, or mood swings' }
];

const HOW_WE_WORK = [
  {
    step: '1',
    title: 'Comprehensive Assessment',
    description: 'Detailed evaluation of your symptoms, lifestyle, and health history',
    icon: CheckCircle2,
    color: 'from-pink-500 to-rose-500'
  },
  {
    step: '2',
    title: 'Personalized Plan',
    description: 'Customized treatment plan addressing root causes',
    icon: Target,
    color: 'from-pink-500 to-rose-500'
  },
  {
    step: '3',
    title: 'Holistic Approach',
    description: 'Nutrition, lifestyle, and natural interventions',
    icon: Heart,
    color: 'from-pink-500 to-rose-500'
  },
  {
    step: '4',
    title: 'Ongoing Support',
    description: 'Continuous monitoring and plan adjustments',
    icon: Users,
    color: 'from-pink-500 to-rose-500'
  }
];

const TESTIMONIALS = [
  {
    name: 'Priya M.',
    role: 'PCOS Recovery',
    content: 'After 2 years of struggling with PCOS, I finally found a holistic approach that worked. My periods are regular now and I&apos;ve lost 15kg naturally.',
    rating: 5
  },
  {
    name: 'Anita R.',
    role: 'Hormonal Balance',
    content: 'The personalized nutrition plan and lifestyle changes transformed my health. My acne cleared up and I have so much more energy now.',
    rating: 5
  },
  {
    name: 'Deepika S.',
    role: 'Weight Management',
    content: 'I tried everything for PCOS weight loss. This approach finally worked because it addressed the root causes, not just symptoms.',
    rating: 5
  }
];

export default function PCOSTreatmentPage() {
  const router = useRouter();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all`,
          {
            params: {
              limit: 10
            }
          }
        );
        
        if (response.data.r === 's') {
          const expertsData = response.data.data.map((item: any) => ({
            _id: item._id,
            name: item.name,
            image: item.image || '/defaultCommunityIcon.png',
            bio: item.bio || '',
            expertise: item.tags || [],
            experience: item.experience || 0,
            sessionsCount: item.sessionsCount || 0,
            min_offering_id: item.min_offering_id
          }));
          // Filter for PCOS-related experts
          const pcosExperts = expertsData.filter(expert => 
            expert.expertise.some(tag => 
              tag.toLowerCase().includes('pcos') || 
              tag.toLowerCase().includes('hormonal') ||
              tag.toLowerCase().includes('nutrition') ||
              tag.toLowerCase().includes('wellness')
            )
          );
          setExperts(pcosExperts.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch experts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  const handleBookCall = () => {
    router.push('/find-expert');
  };

  const handleExpertClick = (expert: Expert) => {
    if (expert.min_offering_id) {
      router.push(`/offering/${expert.min_offering_id}`);
    } else {
      router.push(`/community/${expert._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your PCOS Journey with<br />
                <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 bg-clip-text text-transparent">
                  Expert Guidance
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Holistic approach to PCOS management that addresses root causes, not just symptoms
              </p>
              
              <Button 
                onClick={handleBookCall}
                size="lg"
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-8"
              >
                Start Your PCOS Recovery
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span><strong>500+</strong> PCOS success stories</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-600" />
                  <span><strong>85%</strong> see improvement in 90 days</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. What is PCOS Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Understanding PCOS & PCOD
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Polycystic Ovary Syndrome (PCOS) and Polycystic Ovary Disease (PCOD) are hormonal disorders affecting millions of women worldwide. While often used interchangeably, they have distinct characteristics.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">PCOS (Polycystic Ovary Syndrome)</h3>
                    <p className="text-gray-600">More severe condition affecting multiple systems in the body</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">PCOD (Polycystic Ovary Disease)</h3>
                    <p className="text-gray-600">Primarily affects the ovaries with milder symptoms</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-8 h-80 flex items-center justify-center">
                <Heart className="w-32 h-32 text-pink-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Symptoms Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Common PCOS Symptoms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recognizing these symptoms is the first step towards effective management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SYMPTOMS.map((symptom, index) => (
              <motion.div
                key={symptom.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg">
                    <symptom.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{symptom.title}</h3>
                  <p className="text-gray-600">{symptom.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How We Work */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Holistic Approach
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We address the root causes of PCOS, not just the symptoms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_WE_WORK.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center relative"
              >
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="bg-pink-100 text-pink-800 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real women, real results with our PCOS management approach
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="p-6 h-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">&quot;{testimonial.content}&quot;</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-pink-600">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Our Experts */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our PCOS Specialists
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert guidance from certified professionals specializing in PCOS management
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {experts.map((expert, index) => (
                <motion.div
                  key={expert._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card 
                    className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-pink-300 h-full"
                    onClick={() => handleExpertClick(expert)}
                  >
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="rounded-full object-cover border-4 border-pink-100"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{expert.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{expert.bio}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4 justify-center">
                      {expert.expertise.slice(0, 2).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      size="sm"
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white"
                    >
                      Book Session
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-pink-600 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your PCOS Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Book a free consultation with our PCOS specialists and start your holistic recovery today.
          </p>
          <Button 
            onClick={handleBookCall}
            size="lg"
            className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Book Free Consultation 📞
          </Button>
        </div>
      </section>
    </div>
  );
}