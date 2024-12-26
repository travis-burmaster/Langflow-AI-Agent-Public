'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

type User = {
  id: string;
  userId: string;
  email: string;
  isApproved: boolean;
  createdAt: string;
};

export default function ApprovalManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/approval/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, isApproved: boolean) => {
    try {
      const response = await fetch('/api/auth/approval/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isApproved }),
      });

      if (!response.ok) throw new Error('Failed to update user status');
      await fetchUsers(); // Refresh the user list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>User Approval Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  Status: {user.isApproved ? 'Approved' : 'Pending'}
                </p>
              </div>
              <div className="space-x-2">
                {!user.isApproved && (
                  <Button
                    onClick={() => handleApproval(user.userId, true)}
                    variant="outline"
                    size="icon"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                {user.isApproved && (
                  <Button
                    onClick={() => handleApproval(user.userId, false)}
                    variant="outline"
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}