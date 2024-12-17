import { BrainCircuit, LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

// export type Review = {
//   name: string;
//   image: string;
// };

// export const reviews: Review[] = [
//   {
//     name: 'John Doe',
//     image: '/images/reviews/john-doe.jpg',
//   },
//   {
//     name: 'Jane Doe',
//     image: '/images/reviews/jane-doe.jpg',
//   },
// ];

export type FeatureItem = {
  name: string;
  description: string[];
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >;
};

export const features: FeatureItem[] = [
  {
    name: 'Courses',
    description: [
      'Courses that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Courses that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Courses that are verified and recommended by experts, with a focus on quality and effectiveness.',
    ],
    icon: BrainCircuit,
  },
  {
    name: 'Tools',
    description: [
      'Tools that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Tools that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Tools that are verified and recommended by experts, with a focus on quality and effectiveness.',
    ],
    icon: BrainCircuit,
  },
  {
    name: 'Libraries/Codepens',
    description: [
      'Libraries/Codepens that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Libraries/Codepens that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Libraries/Codepens that are verified and recommended by experts, with a focus on quality and effectiveness.',
    ],
    icon: BrainCircuit,
  },
  {
    name: 'Blogs',
    description: [
      'Blogs that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Blogs that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Blogs that are verified and recommended by experts, with a focus on quality and effectiveness.',
    ],
    icon: BrainCircuit,
  },
  {
    name: 'Podcasts',
    description: [
      'Podcasts that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Podcasts that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Podcasts that are verified and recommended by experts, with a focus on quality and effectiveness.',
    ],
    icon: BrainCircuit,
  },
  {
    name: 'People',
    description: [
      'People to follow that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'People to follow that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'People to follow that are verified and recommended by experts, with a focus on quality and effectiveness.',
    ],
    icon: BrainCircuit,
  },
  {
    name: 'Learning maps',
    description: [
      'Learning maps that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Learning maps that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Learning maps that are verified and recommended by experts, with a focus on quality and effectiveness.',
    ],
    icon: BrainCircuit,
  },
  {
    name: 'Tips and tricks',
    description: [
      'Tips and tricks that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Tips and tricks that are verified and recommended by experts, with a focus on quality and effectiveness.',
      'Tips and tricks that are verified and recommended by experts, with a focus on quality and effectiveness.',
    ],
    icon: BrainCircuit,
  },
];

export type PricingItem = {
  name: string;
  price: number;
  salePrice: number;
  features: string[];
  buyLink: string;
};

export const pricing: PricingItem[] = [
  {
    name: 'Basic',
    price: 10,
    salePrice: 7,
    features: ['Basic features', 'Basic features', 'Basic features'],
    buyLink: 'https://example.com/buy/basic',
  },
  {
    name: 'Pro',
    price: 20,
    salePrice: 14,
    features: ['Pro features', 'Pro features', 'Pro features'],
    buyLink: 'https://example.com/buy/pro',
  },
  {
    name: 'Enterprise',
    price: 30,
    salePrice: 21,
    features: [
      'Enterprise features',
      'Enterprise features',
      'Enterprise features',
    ],
    buyLink: 'https://example.com/buy/enterprise',
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const faq: FaqItem[] = [
  {
    question: 'What makes the courses on your platform unique?',
    answer:
      'Our courses are carefully curated and verified by industry experts to ensure the highest quality and effectiveness for learners.',
  },
  {
    question: 'How often are new resources added to the platform?',
    answer:
      'We continuously update our platform with new courses, tools, libraries, and other resources to keep up with the latest trends and best practices in the field.',
  },
  {
    question: 'Can I access the resources on mobile devices?',
    answer:
      'Yes, our platform is fully responsive and optimized for access on desktop, tablet, and mobile devices.',
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes, we offer a 14-day free trial for new users to explore the platform and its resources before committing to a subscription.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit cards, PayPal, and bank transfers for subscription payments.',
  },
  {
    question: 'How can I cancel my subscription?',
    answer:
      'You can easily cancel your subscription at any time from your account settings page. No further charges will be made after cancellation.',
  },
  {
    question: 'Is there a discount for annual subscriptions?',
    answer:
      'Yes, we offer a 20% discount for users who choose to pay annually instead of monthly.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "We offer a 30-day money-back guarantee for all subscriptions. If you're not satisfied with the platform, you can request a full refund within the first 30 days.",
  },
  {
    question: 'How can I request a new feature or resource?',
    answer:
      'We value user feedback! You can submit feature requests and resource suggestions through our dedicated feedback form or by contacting our support team.',
  },
  {
    question: 'Is my personal information secure on your platform?',
    answer:
      'Yes, we take data privacy and security seriously. All personal information is encrypted and stored securely, and we never share your data with third parties without your consent.',
  },
];
