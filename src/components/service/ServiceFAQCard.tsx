import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I book a service on AfixZ?",
    answer:
      "Select your preferred service, choose your location, and place a booking request. Our support team or assigned professional will contact you shortly for confirmation.",
  },
  {
    question: "Are the professionals verified and trained?",
    answer:
      "Yes. All professionals on AfixZ go through identity verification and onboarding quality checks before offering services on the platform.",
  },
  {
    question: "Can I reschedule or cancel my booking?",
    answer:
      "Yes. You can request a reschedule or cancellation depending on service timelines and professional availability.",
  },
  {
    question: "Do I need to pay before the service?",
    answer:
      "Some services may require advance confirmation charges, while others can be paid after completion. Payment details are shared during booking confirmation.",
  },
  {
    question: "What happens after I place a booking request?",
    answer:
      "Once your booking is submitted, our team reviews the request and connects you with the appropriate service professional for scheduling and execution.",
  },
  {
    question: "Is there any warranty or revisit support?",
    answer:
      "Certain services may include limited service warranty or revisit support depending on the issue and service category.",
  },
  {
    question: "How can I contact support if I face an issue?",
    answer:
      "You can contact AfixZ support through WhatsApp, direct phone support, or by raising a support ticket from your profile section.",
  },
];

const ServiceFAQCard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Frequently Asked Questions
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Common questions about bookings, professionals, payments, and support.
        </p>
      </div>

      {/* FAQ List */}
      <div className="divide-y divide-slate-100">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div key={faq.question}>
              <button
                onClick={() =>
                  setActiveIndex(isOpen ? null : index)
                }
                className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-slate-900"
              >
                <span className="text-sm font-medium leading-6 text-slate-800 sm:text-[15px]">
                  {faq.question}
                </span>

                <ChevronDown
                  size={18}
                  className={`mt-1 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen
                    ? "grid-rows-[1fr] pb-5"
                    : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pr-6 text-sm leading-7 text-slate-500">
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