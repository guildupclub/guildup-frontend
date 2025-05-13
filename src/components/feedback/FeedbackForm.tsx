'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FeedbackFormProps {
  bookingId: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ bookingId }) => {
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/bookings/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      const data = await res.json();
      console.log(data);
      if (data.r !== "s") {
        throw new Error(data.e || 'Failed to submit feedback');
      }
      // Refresh the page to load thank-you state
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="rating" className="block mb-1 font-medium">Rating</label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded p-2 w-full"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} Star{n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="comment" className="block mb-1 font-medium">Comments</label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

export default FeedbackForm; 