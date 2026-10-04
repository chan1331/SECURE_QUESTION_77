'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Loading from '@/components/Loading';

export default function DashboardRedirectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else {
        switch (user.role) {
          case 'Question Setter':
            router.push('/setter');
            break;
          case 'Reviewer':
            router.push('/reviewer');
            break;
          case 'Examination Authority':
            router.push('/authority');
            break;
          case 'Examination Center':
            router.push('/exam-center');
            break;
          case 'Admin':
            router.push('/admin');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [user, isLoading, router]);

  return <Loading message="Redirecting to authorized role workspace..." />;
}
