import React from 'react';

interface TestimonialSectionProps {
  expertName?: string;
}

const testimonials = [
  {
    name: 'Bella Joy',
    text: 'Lorem ipsum dolor sit amet consectetur. Nec ornare scelerisque elementum amet interdum aliquam. Tellus phasellus eget etiam eu.',
    image: '/defaultCommunityIcon.png',
    rating: 4,
  },
  {
    name: 'Bella Joy',
    text: 'Lorem ipsum dolor sit amet consectetur. Nec ornare scelerisque elementum amet interdum aliquam. Tellus phasellus eget etiam eu.',
    image: '/defaultCommunityIcon.png',
    rating: 4,
  },
  {
    name: 'Bella Joy',
    text: 'Lorem ipsum dolor sit amet consectetur. Nec ornare scelerisque elementum amet interdum aliquam. Tellus phasellus eget etiam eu.',
    image: '/defaultCommunityIcon.png',
    rating: 4,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function TestimonialSection({ expertName = "Expert" }: TestimonialSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-8 py-16 bg-white">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Client's words for us</h2>
        <h3 className="text-3xl font-bold text-blue-600">Over 100+ Learners Trusted {expertName}</h3>
      </div>

      {/* Testimonials Layout */}
      <div className="relative h-96 max-w-6xl mx-auto">
        {/* Left floating testimonial - positioned diagonally */}
        <div className="absolute left-0 top-12 w-80 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {testimonials[0].text}
          </p>
          
          <div className="flex items-center gap-3">
            <img
              src={testimonials[0].image}
              alt={testimonials[0].name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                {testimonials[0].name}
              </h4>
              <StarRating rating={testimonials[0].rating} />
            </div>
          </div>
        </div>

        {/* Right floating testimonial - positioned diagonally */}
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {testimonials[2].text}
          </p>
          
          <div className="flex items-center gap-3">
            <img
              src={testimonials[2].image}
              alt={testimonials[2].name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                {testimonials[2].name}
              </h4>
              <StarRating rating={testimonials[2].rating} />
            </div>
          </div>
        </div>

        {/* Center main testimonial - elevated and prominent */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 z-20">
          <div className="bg-white rounded-2xl border-2 border-blue-400 p-8 shadow-2xl">
            <p className="text-gray-700 leading-relaxed mb-8 text-base">
              {testimonials[1].text}
            </p>
            
            <div className="flex items-center gap-4">
              <img
                src={testimonials[1].image}
                alt={testimonials[1].name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  {testimonials[1].name}
                </h4>
                <StarRating rating={testimonials[1].rating} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
