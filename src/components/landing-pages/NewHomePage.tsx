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
  Brain,
  User,
  Calendar,
  CheckCircle2,
  Zap,
  Target,
  Lightbulb,
  TrendingUp
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

const PROGRAMS = [
  {
    icon: Heart,
    title: 'PCOS & Hormonal Health',
    description: 'Balance your hormones, lose stubborn weight, and regain energy naturally with expert guidance.',
    route: '/pcos-treatment',
    gradient: 'from-blue-50 to-blue-100',
    iconGradient: 'from-blue-500 to-blue-600'
  },
  {
    icon: Brain,
    title: 'Stress & Anxiety Management',
    description: 'Find inner peace, reduce anxiety, and build resilience through holistic mental wellness support.',
    route: '/anxiety-stress-therapy',
    gradient: 'from-indigo-50 to-blue-50',
    iconGradient: 'from-indigo-500 to-blue-500'
  },
  {
    icon: User,
    title: 'Relationship & Mental Wellness',
    description: 'Strengthen connections, improve communication, and heal emotional patterns with expert therapists.',
    route: '/relationship-wellness',
    gradient: 'from-slate-50 to-blue-50',
    iconGradient: 'from-blue-500 to-blue-600'
  }
];

const HOW_WE_WORK = [
  {
    step: '1',
    title: 'Book Free Clarity Call',
    description: 'Share your wellness goals and challenges',
    icon: Calendar,
    color: 'from-blue-500 to-blue-600'
  },
  {
    step: '2',
    title: 'Get Matched with Expert',
    description: 'We connect you with the right specialist',
    icon: Users,
    color: 'from-blue-500 to-blue-600'
  },
  {
    step: '3',
    title: 'Receive Your Plan',
    description: 'Personalized 90-day wellness roadmap',
    icon: Target,
    color: 'from-blue-500 to-blue-600'
  },
  {
    step: '4',
    title: 'Start Your Journey',
    description: 'Begin your transformation with expert support',
    icon: Zap,
    color: 'from-blue-500 to-blue-600'
  }
];

const DIFFERENTIATORS = [
  {
    icon: Heart,
    title: 'Holistic Approach',
    description: 'Mind, body, and lifestyle - not just symptoms',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    icon: Target,
    title: 'Lifestyle Focused',
    description: 'Sustainable changes, not quick fixes',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    icon: Lightbulb,
    title: 'Inner Self Oriented',
    description: 'Understanding root causes, not just treating effects',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    icon: TrendingUp,
    title: 'Proven Results',
    description: '90% see improvement in 30 days',
    gradient: 'from-blue-500 to-blue-600'
  }
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'PCOS Recovery',
    content: 'I finally found someone who understood my PCOS journey. The personalized approach made all the difference.',
    rating: 5
  },
  {
    name: 'Priya K.',
    role: 'Stress Management',
    content: 'The anxiety management techniques I learned here have transformed my daily life. Highly recommended!',
    rating: 5
  },
  {
    name: 'Anita R.',
    role: 'Relationship Wellness',
    content: 'My relationship with my partner improved dramatically after just a few sessions. Thank you!',
    rating: 5
  },
  {
    name: 'Deepika S.',
    role: 'Hormonal Balance',
    content: 'The holistic approach to hormonal health was exactly what I needed. Feeling so much better now.',
    rating: 5
  },
  {
    name: 'Meera P.',
    role: 'Mental Wellness',
    content: 'The expert guidance helped me overcome years of stress and anxiety. Life-changing experience.',
    rating: 5
  },
  {
    name: 'Riya T.',
    role: 'Wellness Journey',
    content: 'The personalized care and attention to detail made all the difference in my wellness journey.',
    rating: 5
  }
];

export default function NewHomePage() {
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
          setExperts(expertsData.slice(0, 10));
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
      <section className="relative bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your Health with<br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                  Expert Guidance
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Join our community of 120+ verified experts helping 1000+ people achieve their wellness goals
              </p>
              
              <Button 
                onClick={handleBookCall}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-8"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span><strong>Trusted by 1000+</strong> people</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span><strong>120+ verified</strong> experts</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Programs Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Wellness Path
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert-led programs designed to help you achieve your health and wellness goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PROGRAMS.map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card 
                  className={`p-8 h-full bg-gradient-to-br ${program.gradient} border-2 border-transparent hover:border-blue-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group`}
                  onClick={() => router.push(program.route)}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${program.iconGradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <program.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    {program.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {program.description}
                  </p>

                  {/* CTA Button */}
                  <Button
                    className="w-full bg-white/80 hover:bg-white text-gray-900 font-semibold shadow-md group-hover:shadow-lg transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(program.route);
                    }}
                  >
                    Explore Program
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How We're Different / Our Approach */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why GuildUp Works Differently
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our unique approach combines expert knowledge with personalized care
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {DIFFERENTIATORS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${item.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Highlight Box */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 md:p-12 text-center shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              Results in Exceptional Time
            </h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg">90% see improvement in 30 days</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg">Personalized plans, not one-size-fits-all</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. How We Work */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How We Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your journey to wellness in 4 simple steps
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
                <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Not Sure CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Not Sure Which Program Is Right for You?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Book a free 15-minute consultation with our specialists to discuss your goals and find your perfect match.
          </p>
          <Button 
            onClick={handleBookCall}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Talk to Our Specialist 📞
          </Button>
        </div>
      </section>

      {/* 6. Featured Experts */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Verified professionals with proven track records in their respective fields
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {experts.slice(0, 8).map((expert, index) => (
                <motion.div
                  key={expert._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <Card 
                    className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-blue-300 h-full"
                    onClick={() => handleExpertClick(expert)}
                  >
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="rounded-full object-cover border-4 border-blue-100"
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
                      {expert.expertise.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{expert.expertise.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{expert.experience}+ years</span>
                      <span>•</span>
                      <span>{expert.sessionsCount}+ sessions</span>
                    </div>

                    <Button 
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      Book Session
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button 
              onClick={() => router.push('/community')}
              variant="outline"
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              View All Experts
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Real Stories, Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              What our community says
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
                    <p className="text-sm text-blue-600">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA (Before Blogs) */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want to Know How We&apos;re Unique?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Book a free consultation and discover the difference our personalized approach can make in your wellness journey.
          </p>
          <Button 
            onClick={handleBookCall}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Talk to Our Specialist 📞
          </Button>
        </div>
      </section>

      {/* 9. Blogs & Posts Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Latest Insights & Tips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert advice and wellness tips to support your journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="h-48 bg-gradient-to-br from-blue-200 to-blue-300"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sample Blog Title {i}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Preview of the blog content goes here...
                  </p>
                  <Button variant="link" className="p-0 text-blue-600">
                    Read More <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/blog')}
              variant="outline"
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              Read All Articles
            </Button>
            <Button 
              onClick={() => router.push('/feeds')}
              variant="outline"
              size="lg"
              className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
            >
              View All Posts
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}