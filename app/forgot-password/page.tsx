'use client';

import { useState } from 'react';
import Image from 'next/image';
import { resetPassword, createPasswordResetOtp, verifyPasswordResetOtp, getUserByEmail } from '../../lib/users';
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';

interface FormData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPassword() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOtpEmail = async (email: string, otp: string) => {
    const templateParams = {
      to_email: email,
      otp: otp,
    };

    console.log('EmailJS Config:', {
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    });

    console.log('Sending OTP email to:', email, 'with OTP:', otp);

    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      console.log('EmailJS result:', result);
      return result;
    } catch (emailError) {
      console.error('EmailJS send error:', emailError);
      throw emailError;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Email',
        text: 'Please enter your email address.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // First check if user exists
      const user = await getUserByEmail(formData.email);
      if (!user) {
        Swal.fire({
          icon: 'error',
          title: 'User Not Found',
          text: 'No account found with this email address.',
        });
        return;
      }

      const otp = generateOtp();
      await createPasswordResetOtp(formData.email, otp);
      await sendOtpEmail(formData.email, otp);
      setStep('otp');
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent',
        text: 'Please check your email for the OTP.',
      });
    } catch (error) {
      console.error('OTP send error:', error);

      let errorMessage = 'Failed to send OTP. Please try again.';

      if (error instanceof Error) {
        if (error.message?.includes('permission') || error.message?.includes('RLS')) {
          errorMessage = 'Database permission error. Please contact administrator to disable RLS for password_reset_otps table.';
        } else if (error.message?.includes('table does not exist')) {
          errorMessage = 'Database table not found. Please contact administrator to create password_reset_otps table.';
        } else {
          errorMessage = `Failed to send OTP: ${error.message}`;
        }
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp) {
      Swal.fire({
        icon: 'error',
        title: 'Missing OTP',
        text: 'Please enter the OTP.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await verifyPasswordResetOtp(formData.email, formData.otp);
      if (!isValid) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          text: 'The OTP you entered is incorrect or has expired.',
        });
        return;
      }

      setStep('password');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to verify OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.newPassword || !formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill in all fields.',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New password and confirm password do not match.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(formData.email, formData.newPassword);
      Swal.fire({
        icon: 'success',
        title: 'Password Reset Successful',
        text: 'Your password has been reset. Please wait for admin approval before logging in.',
      });
      // Reset form
      setFormData({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
      });
      setStep('email');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#107DAC' }}>
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-2xl">
        <div>
          <Image className="mx-auto h-30 w-30" src="/Logo.png" alt="Logo" width={120} height={120} loading="eager" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to reset your password.
          </p>
        </div>

        {step === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div className="space-y-4">
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50"
              >
                Verify OTP
              </button>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}