'use client';

import { Button } from '@/components/ui/button';
import { signOut } from './actions';
import { useActionState } from 'react';

const initialState = {
  message: '',
};

export default function SignOutButton() {
  const [, action] = useActionState(signOut, initialState);

  return (
    <form action={action}>
      <Button type='submit'>Sign out</Button>
    </form>
  );
}
