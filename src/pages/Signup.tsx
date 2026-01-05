import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import { RegisterCredentials } from '../types';

const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (credentials: RegisterCredentials) => {
    await register(credentials);
    navigate('/');
  };

  return (
    <div className="h-auto bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthForm onSubmit={handleSignup} isLogin={false} />
        </div>
      </div>
    </div>
  );
};

export default Signup;

