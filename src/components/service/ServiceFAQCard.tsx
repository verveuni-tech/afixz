import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does the service take?",
    answer: "Typically between 60–90 minutes depending on unit condition.",
  },
  {
    question: "Is gas refill included?",
    answer: "Gas refill is charged separately if required.",
  },
  {
    question: "Can I reschedule my booking?",
    answer: "Yes, you can reschedule up to 2 hours before the scheduled time.",
  },
  {
    question: "What if I am not satisfied?",
    answer: "We offer a service warranty for eligible issues.",
  },
];

const ServiceFAQCard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 p-10">

      <h3 className="text-2xl font-semibold tracking-tight mb-8">
        Frequently Asked Questions
      </h3>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-slate-50 rounded-2xl transition-all duration-200"
          >
            <button
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              className="w-full flex items-center justify-between px-6 py-5 text-left font-medium text-slate-800 hover:bg-slate-100 rounded-2xl transition"
            >
              {faq.question}

              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeIndex === index && (
              <div className="px-6 pb-6 text-slate-600 text-sm">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default ServiceFAQCard;