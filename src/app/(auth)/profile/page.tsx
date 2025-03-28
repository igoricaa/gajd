import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProfileForm } from '@/components/profile/profile-form';
import { PaymentDetails } from '@/components/profile/payment-details';
import { SubscriptionHistory } from '@/components/profile/subscription-history';
import { SubscriptionPlans } from '@/components/profile/subscription-plans';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your account settings and subscription.',
};

export default function ProfilePage() {
  return (
    <div className='mx-auto w-full max-w-7xl py-6'>
      <div className='flex flex-col gap-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Profile</h1>
          <p className='text-muted-foreground'>
            Manage your account settings and subscription details.
          </p>
        </div>

        <Tabs defaultValue='profile' className='space-y-4 mt-4'>
          <TabsList className='gap-4 mb-4'>
            <TabsTrigger value='profile'>Profile</TabsTrigger>
            <TabsTrigger value='payment'>Payment</TabsTrigger>
            <TabsTrigger value='subscription'>Subscription</TabsTrigger>
            <TabsTrigger value='history'>History</TabsTrigger>
          </TabsList>

          <ProfileTab
            value='profile'
            title='Profile Information'
            description='Update your personal information and account settings.'
            content={<ProfileForm />}
          />

          <ProfileTab
            value='payment'
            title='Payment Details'
            description='Manage your payment methods and billing information.'
            content={<PaymentDetails />}
          />

          <ProfileTab
            value='subscription'
            title='Subscription Plans'
            description='View available plans and manage your subscription.'
            content={<SubscriptionPlans />}
          />

          <ProfileTab
            value='history'
            title='Subscription History'
            description='View your past transactions and subscription changes.'
            content={<SubscriptionHistory />}
          />
        </Tabs>
      </div>
    </div>
  );
}

type ProfileTabProps = {
  value: string;
  title: string;
  description: string;
  content: React.ReactNode;
  className?: string;
};

const ProfileTab = ({
  value,
  title,
  description,
  content,
  className,
}: ProfileTabProps) => {
  return (
    <TabsContent value={value} className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription className='mt-4 text-sm'>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className='mt-4'>{content}</CardContent>
      </Card>
    </TabsContent>
  );
};
