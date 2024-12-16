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
