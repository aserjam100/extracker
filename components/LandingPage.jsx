import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Track Your Expenses Simply
          </h2>

          <p className="text-xl text-gray-600 mb-8">
            Keep your finances organized with our clean and simple expense
            tracking app.
          </p>

          <div className="flex gap-4 justify-center">
            <Button size="lg" className="px-8">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              Learn More
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
