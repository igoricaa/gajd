'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Plus } from 'lucide-react';
import { useState } from 'react';

const MOCK_PAYMENT_METHODS = [
  {
    id: '1',
    cardBrand: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2025',
    isDefault: true,
  },
  {
    id: '2',
    cardBrand: 'Mastercard',
    last4: '8888',
    expiryMonth: '03',
    expiryYear: '2026',
    isDefault: false,
  },
];

export function PaymentDetails() {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium'>Payment Methods</h3>
        <Button onClick={() => setIsAddCardOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Card
        </Button>
      </div>

      <div className='grid gap-4'>
        {MOCK_PAYMENT_METHODS.map((method) => (
          <Card key={method.id}>
            <CardContent className='flex items-center justify-between p-6'>
              <div className='flex items-center space-x-4'>
                <CreditCard className='h-6 w-6 text-muted-foreground' />
                <div>
                  <p className='font-medium'>
                    {method.cardBrand} •••• {method.last4}
                    {method.isDefault && (
                      <span className='ml-2 text-sm text-muted-foreground'>
                        (Default)
                      </span>
                    )}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
              </div>
              <Button variant='outline' size='sm'>
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
