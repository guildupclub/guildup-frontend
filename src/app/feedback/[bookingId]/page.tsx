import FeedbackForm from '@/components/feedback/FeedbackForm';
import ThankYou from '@/components/feedback/ThankYou';

interface FeedbackPageProps { params: { bookingId: string } }

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { bookingId } = params;
  let submitted = false;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/bookings/api/feedback/status?bookingId=${bookingId}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const result = await res.json();
      submitted = result.data?.submitted;
    } else {
      console.error('Failed to fetch feedback status:', await res.text());
    }
  } catch (error) {
    console.error('Error checking feedback status', error);
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Share Your Feedback</h1>
      {submitted ? <ThankYou /> : <FeedbackForm bookingId={bookingId} />}
    </div>
  );
} 