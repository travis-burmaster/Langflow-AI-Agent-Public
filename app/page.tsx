import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-blue-100 to-white">
      <div className="text-center space-y-8 p-8 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg max-w-2xl mx-4 border border-blue-100">
        <h1 className="text-4xl font-bold text-blue-900 tracking-tight sm:text-6xl">
          Welcome to AI Agent
        </h1>
        
        <p className="text-lg text-blue-700 leading-relaxed">
          Your intelligent agent to run workflows 24/7.
          <br />
          Create, manage and monitor your workflows no matter where you are.
        </p>

        <div className="flex justify-center gap-4">
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-md transition-all"
          >
            <Link href="/sign-in">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}