import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              SMS Trading
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          <SignIn 
            routing="path"
            path="/sign-in"
            afterSignInUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
