import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does the service take?",
    answer:
      "Typically between 60–90 minutes depending on unit condition.",
  },
  {
    question: "Is gas refill included?",
    answer:
      "Gas refill is charged separately if required after inspection.",
  },
  {
    question: "Can I reschedule my booking?",
    answer:
      "Yes, you can reschedule up to 2 hours before the scheduled time.",
  },
  {
    question: "What if I am not satisfied?",
    answer:
      "We offer a 30-day service warranty for eligible issues.",
  },
];

const ServiceFAQCard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <h3 className="text-2xl font-semibold mb-6">
        Frequently Asked Questions
      </h3>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-slate-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-medium text-slate-900">
                {faq.question}
              </span>

              <ChevronDown
                size={18}
                className={`transition-transform ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeIndex === index && (
              <div className="px-5 pb-4 text-slate-600 text-sm">
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