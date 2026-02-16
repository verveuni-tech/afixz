import { 
  Wrench, 
  Zap, 
  Thermometer, 
  Sparkles, 
  MonitorSmartphone, 
  Scissors, 
  CalendarCheck, 
  UserCheck, 
  ShieldCheck,
  Clock,
  BadgeCheck,
  CircleDollarSign
} from 'lucide-react';
import { Service, Step, Feature, Testimonial } from './types';

export const SERVICES: Service[] = [
  {
    id: 'plumbing',
    title: 'Expert Plumbing',
    description: 'Leak repairs, pipe installation, and emergency maintenance by certified plumbers.',
    icon: Wrench,
  },
  {
    id: 'electrician',
    title: 'Electrical Services',
    description: 'Wiring, switchboard repairs, and safety inspections for your home.',
    icon: Zap,
  },
  {
    id: 'ac-repair',
    title: 'AC Service & Repair',
    description: 'Deep cleaning, gas refill, and maintenance for peak cooling efficiency.',
    icon: Thermometer,
  },
  {
    id: 'cleaning',
    title: 'Deep Cleaning',
    description: 'Professional home cleaning services ensuring a spotless and hygienic environment.',
    icon: Sparkles,
  },
  {
    id: 'appliance',
    title: 'Appliance Repair',
    description: 'Quick fixes for washing machines, microwaves, refrigerators, and more.',
    icon: MonitorSmartphone,
  },
  {
    id: 'salon',
    title: 'Salon at Home',
    description: 'Premium grooming and beauty services delivered at your doorstep.',
    icon: Scissors,
  },
];

export const STEPS: Step[] = [
  {
    id: 1,
    title: 'Choose a Service',
    description: 'Select from our wide range of professional home services tailored to your needs.',
    icon: UserCheck,
  },
  {
    id: 2,
    title: 'Select a Time',
    description: 'Pick a convenient time slot. Our professionals work around your schedule.',
    icon: CalendarCheck,
  },
  {
    id: 3,
    title: 'Relax & Enjoy',
    description: 'Sit back while our verified experts handle the rest with care and precision.',
    icon: ShieldCheck,
  },
];

export const TRUST_PILLARS: Feature[] = [
  {
    id: 'verified',
    title: 'Verified Professionals',
    description: 'Every expert undergoes a rigorous background check and skill assessment.',
    icon: BadgeCheck,
  },
  {
    id: 'transparent',
    title: 'Transparent Pricing',
    description: 'Upfront quotes. No hidden fees. You pay exactly what you see.',
    icon: CircleDollarSign,
  },
  {
    id: 'ontime',
    title: 'On-Time Service',
    description: 'We value your time. Our professionals are punctual and efficient.',
    icon: Clock,
  },
  {
    id: 'quality',
    title: 'Quality Assurance',
    description: 'Satisfaction guaranteed with our high standards of service delivery.',
    icon: ShieldCheck,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Mitchell',
    role: 'Homeowner',
    content: "The electrician arrived exactly on time and fixed the wiring issue in under an hour. Highly professional service!",
    avatarUrl: 'https://picsum.photos/100/100?random=1',
    rating: 5,
  },
  {
    id: 't2',
    name: 'David Chen',
    role: 'Architect',
    content: "I needed a deep clean before moving into my new apartment. AfixZ's team did a phenomenal job. It felt brand new.",
    avatarUrl: 'https://picsum.photos/100/100?random=2',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Emily Johnson',
    role: 'Freelancer',
    content: "Booking a salon service at home was so convenient. The beautician was polite and the hygiene standards were top-notch.",
    avatarUrl: 'https://picsum.photos/100/100?random=3',
    rating: 4,
  },
];
