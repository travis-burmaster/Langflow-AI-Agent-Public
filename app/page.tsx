import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Brain, Calendar, Dumbbell, Trophy } from 'lucide-react';

const features = [
  {
    title: "Personalized Training Plans",
    description: "AI-generated plans that adapt to your progress and goals",
    icon: Calendar,
  },
  {
    title: "Smart Analysis",
    description: "Real-time feedback on your running form and performance",
    icon: Brain,
  },
  {
    title: "Strength Training",
    description: "Complementary exercises to improve your running",
    icon: Dumbbell,
  },
  {
    title: "Goal Achievement",
    description: "Track your progress and celebrate your victories",
    icon: Trophy,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&q=80')",
        }}
      />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-center h-full max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Your Personal AI Running Coach
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8">
              Transform your running with personalized AI coaching that adapts to your goals, fitness level, and schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Link href="/protected/chat">
                  Start Your Journey
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose AI Running Coach?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the future of running training with our cutting-edge AI technology
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}