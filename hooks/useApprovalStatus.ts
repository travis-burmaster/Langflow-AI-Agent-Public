import { useEffect, useState } from 'react';

type ApprovalStatus = {
  isApproved: boolean;
  isLoading: boolean;
  error: string | null;
};

export function useApprovalStatus() {
  const [status, setStatus] = useState<ApprovalStatus>({
    isApproved: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const response = await fetch('/api/auth/approval/check');
        if (!response.ok) throw new Error('Failed to fetch approval status');
        const data = await response.json();
        setStatus({
          isApproved: data.isApproved,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setStatus({
          isApproved: false,
          isLoading: false,
          error: err instanceof Error ? err.message : 'An error occurred',
        });
      }
    };

    checkApprovalStatus();
  }, []);

  return status;
}
