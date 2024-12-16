'use client';

import { FeatureItem } from '@/data/data';
import { features } from '@/data/data';
import { useState } from 'react';

const FeaturesInfo = () => {
  const [selectedItem, setSelectedItem] = useState<FeatureItem>(features[0]);

  return (
    <>
      <div className='max-w-3xl mx-auto flex gap-4 mt-8'>
        {features.map((item: FeatureItem) => (
          <span
            key={item.name}
            className='flex flex-col gap-3 items-center cursor-pointer'
            onClick={() => setSelectedItem(item)}
          >
            <span>
              <item.icon />
            </span>
            <span className='text-center'>{item.name}</span>
          </span>
        ))}
      </div>

      <div className='mt-8 bg-black'>
        <div className='max-w-3xl mx-auto py-12 px-8'>
          <p className='text-xl font-bold'>{selectedItem.name}</p>
          <ul className='list-disc list-inside mt-4'>
            {selectedItem.description.map(
              (description: string, index: number) => (
                <li
                  key={description + index}
                  className={index === 0 ? '' : 'mt-2'}
                >
                  {description}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default FeaturesInfo;
