import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-start justify-center pt-16">
      <div className="w-full max-w-md bg-white rounded-lg border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ExTrack</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button formAction={login} className="flex-1">
              Log in
            </Button>
            <Button formAction={signup} variant="outline" className="flex-1">
              Sign up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
