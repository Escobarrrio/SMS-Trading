import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              SMS Trading
            </h1>
            <p className="text-gray-600">Create your account</p>
          </div>
<SignUp routing="hash" afterSignUpUrl="/dashboard" />
        </div>
        <p className="text-center text-gray-300 text-sm mt-6">
          Already have an account?{' '}
          <a href="/sign-in" className="text-white hover:text-blue-200 font-semibold">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
