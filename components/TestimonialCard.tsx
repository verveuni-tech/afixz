import React from 'react';
import { Testimonial } from '../types';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={`${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
          />
        ))}
      </div>
      
      <blockquote className="text-slate-700 text-lg mb-6 flex-grow leading-relaxed">
        "{testimonial.content}"
      </blockquote>
      
      <div className="flex items-center gap-4 mt-auto">
        <img 
          src={testimonial.avatarUrl} 
          alt={testimonial.name} 
          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
        />
        <div>
          <div className="font-bold text-slate-900">{testimonial.name}</div>
          <div className="text-sm text-slate-500">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;