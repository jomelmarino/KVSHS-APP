'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LockClosedIcon } from '@heroicons/react/20/solid'; // Kung gumagamit ka ng Heroicons
import { addUser } from '../../lib/users';
import Swal from 'sweetalert2';

// Mas simple at mas malinis na state management
interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedData = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };
    if (!trimmedData.full_name || !trimmedData.email || !trimmedData.password || !trimmedData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill in all fields.',
      });
      return;
    }
    if (!isValidEmail(trimmedData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return;
    }
    if (trimmedData.password !== trimmedData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Add user to AppUsers table with password
      await addUser({
        full_name: trimmedData.full_name,
        email: trimmedData.email,
        password: trimmedData.password,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Sign Up Successful!',
        text: 'Your account is pending approval. Please wait for admin approval before logging in.',
        confirmButtonText: 'OK'
      });
      router.push('/login');
    } catch (error) {
      const errorMessage = (error as Error)?.message || 'Unknown error occurred during signup';
      if (errorMessage.includes('duplicate key value violates unique constraint "AppUsers_email_key"')) {
        Swal.fire({
          icon: 'error',
          title: 'Email Already Exists',
          text: 'An account with this email address already exists. Please use a different email or try logging in.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: `An error occurred during signup: ${errorMessage}`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✨ **Design Changes: Darker Background & Centering**
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#107DAC' }}>
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-2xl"> {/* Added padding, white background, larger shadow, rounded corners */}

        {/* ## Header */}
        <div>
          <Image className="mx-auto h-30 w-30" src="/Logo.png" alt="Logo" width={120} height={120} loading="eager" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up to get started.
          </p>
        </div>

        {/* --- */}

        {/* ## Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {/* Form Fields - Tinanggal ang -space-y-px para mas maganda ang spacing */}
          <div className="space-y-4"> {/* Increased spacing between fields */}

            {/* Fullname Field */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  autoComplete="name"
                  // ✨ **Design Changes: More rounded, better focus ring**
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

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
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  // ✨ **Design Changes: More rounded, better focus ring**
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  // ✨ **Design Changes: More rounded, better focus ring**
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* --- */}

          {/* ## Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              // ✨ **Design Changes: Bolder button, shadow, slightly larger padding**
              className="group relative flex w-full justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <LockClosedIcon className="h-5 w-5 mr-2" aria-hidden="true" /> {/* Added icon for visual appeal */}
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in here
              </a>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}