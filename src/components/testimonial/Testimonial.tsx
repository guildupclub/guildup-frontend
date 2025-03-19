"use client";

import Marquee from "react-fast-marquee";
import { testimonials } from "./data";

export default function Testimonials() {
  return (
    <div className="py-16 bg-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TestimonialCarousel testimonials={testimonials} />
      </div>
    </div>
  );
}

type Testimonial = {
  text: string;
  image: string;
  name: string;
};

type TestimonialCarouselProps = {
  testimonials: Testimonial[];
};

const TestimonialCarousel = ({ testimonials }: TestimonialCarouselProps) => (
  <Marquee
    className="overflow-hidden relative testimonial-blur"
    direction="right"
  >
    <div className="flex gap-6 relative z-0">
      {testimonials.map((testimonial, index) => (
        <TestimonialCard key={index} testimonial={testimonial} />
      ))}
    </div>
  </Marquee>
);

type TestimonialCardProps = {
  testimonial: Testimonial;
};

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => (
  <div className="w-full min-w-0 ">
    <div className="bg-white p-4 rounded-2xl h-auto flex flex-col shadow-sm   w-72">
      <img
        src={testimonial.image}
        alt={testimonial.name}
        className="w-44 h-auto object-cover rounded-full"
      />
    </div>
  </div>
);
