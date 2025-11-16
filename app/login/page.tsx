'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'; // Kung gumagamit ka ng Heroicons
import { getUserByEmail } from '../../lib/users';
import Swal from 'sweetalert2';

// Mas simple at mas malinis na state management
interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please enter both email and password.',
      });
      return;
    }

    // Get user from AppUsers table
    const userData = await getUserByEmail(formData.email);
    if (!userData) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid email or password.',
      });
      return;
    }

    if (userData.password !== formData.password) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid email or password.',
      });
      return;
    }

    if (userData.status !== 'Approved') {
      Swal.fire({
        icon: 'warning',
        title: 'Account Pending',
        text: 'Your account is pending approval. Please wait for admin approval before logging in.',
      });
      return;
    }

    // Store login state in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', formData.email);

    await Swal.fire({
      icon: 'success',
      title: 'Login Successful!',
      text: 'Welcome back!',
      timer: 1500,
      showConfirmButton: false,
    });

    router.push('/dashboard');
  };


  return (
    // ✨ **Design Changes: Darker Background & Centering**
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#107DAC' }}>
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-2xl"> {/* Added padding, white background, larger shadow, rounded corners */}

        {/* ## Header */}
        <div>
          <Image className="mx-auto h-30 w-30" src="/Logo.png" alt="Logo" width={120} height={120} loading="eager" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to See The Student Enrolled.
          </p>
        </div>

        {/* --- */}

        {/* ## Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {/* Form Fields - Tinanggal ang -space-y-px para mas maganda ang spacing */}
          <div className="space-y-4"> {/* Increased spacing between fields */}
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  // ✨ **Design Changes: More rounded, better focus ring**
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  // ✨ **Design Changes: More rounded, better focus ring**
                  className="appearance-none relative block w-full pl-3 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          
          {/* --- */}

          {/* ## Options (Remember Me & Forgot Password) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 whitespace-nowrap">
                Remember me
              </label>
            </div>
            <div className="ml-6 text-sm">
              <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          {/* --- */}

          {/* ## Submit Button */}
          <div>
            <button
              type="submit"
              // ✨ **Design Changes: Bolder button, shadow, slightly larger padding**
              className="group relative flex w-full justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-md hover:shadow-lg"
            >
              <LockClosedIcon className="h-5 w-5 mr-2" aria-hidden="true" /> {/* Added icon for visual appeal */}
              Sign In
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up here
              </a>
            </p>
          </div>
         </form>

      </div>
    </div>
  );
}