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
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-base font-semibold text-slate-800">
        Frequently Asked Questions
      </h3>

      <div className="mt-4 divide-y divide-slate-100">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div key={index}>
              <button
                onClick={() =>
                  setActiveIndex(isOpen ? null : index)
                }
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
              >
                {faq.question}

                <ChevronDown
                  size={15}
                  className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-200 ${
                  isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-sm leading-6 text-slate-500">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceFAQCard;
