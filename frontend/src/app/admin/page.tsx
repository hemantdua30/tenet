'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import { addUser } from '../lib/auth';

// Expose the addUser function globally
export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Register addUser function in window object
  useEffect(() => {
    if (user?.role === 'admin' && typeof window !== 'undefined') {
      // Make addUser available globally
      window.addUser = addUser;
      
      // Log usage instructions
      console.log('Admin functions ready:');
      console.log('You can add users with window.addUser():');
      console.log(`
window.addUser({
  name: 'New User',
  username: 'newuser',
  password: 'securepass123',
  role: 'user'  // or 'admin' or 'inspector'
});`);
    }
  }, [user]);

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Console</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          <strong>User Management Available</strong>
        </p>
        <p className="text-blue-600">
          The <code className="bg-blue-100 px-1 rounded">addUser</code> function is now registered globally.
          Open the browser console (F12) to add users.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">Add a New User</h2>
        <div className="bg-gray-100 p-3 rounded font-mono text-sm mb-4 whitespace-pre overflow-x-auto">
{`// Open browser console (F12) and run:
window.addUser({
  name: 'New User',
  username: 'newuser',
  password: 'securepass123',
  role: 'user'  // or 'admin' or 'inspector'
});`}
        </div>
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">Default Users</h2>
        <div className="space-y-2">
          <div className="p-3 border rounded">
            <p><strong>Admin:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
          <div className="p-3 border rounded">
            <p><strong>User:</strong> user</p>
            <p><strong>Password:</strong> user123</p>
          </div>
          <div className="p-3 border rounded">
            <p><strong>Inspector:</strong> inspector</p>
            <p><strong>Password:</strong> inspector123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Type declaration for window.addUser
declare global {
  interface Window {
    addUser: typeof addUser;
  }
} 