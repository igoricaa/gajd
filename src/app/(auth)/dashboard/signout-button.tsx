'use client';

import { Button } from '@/components/ui/button';
import { signOut } from './actions';
import { useActionState } from 'react';
import { cn } from '@/lib/utils';

const initialState = {
  message: '',
};

export default function SignOutButton({
  className,
  formClassName,
}: {
  className?: string;
  formClassName?: string;
}) {
  const [state, action] = useActionState(signOut, initialState);

  return (
    <>
      {state.message && <p>{state.message}</p>}
      {!state.message && (
        <form action={action} className={cn(formClassName)}>
          <Button type='submit' className={cn(className)}>
            Sign out
          </Button>
        </form>
      )}
    </>
  );
}
