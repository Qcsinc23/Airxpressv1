// app/booking/confirmation/[id]/page.tsx
import { Suspense } from 'react';
import BookingConfirmation from '../../../components/booking/BookingConfirmation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Suspense fallback={<LoadingSpinner />}>
          <BookingConfirmation bookingId={id} />
        </Suspense>
      </div>
    </div>
  );
}