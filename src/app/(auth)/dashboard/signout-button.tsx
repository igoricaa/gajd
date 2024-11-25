'use client';

import { Button } from '@/components/ui/button';
import { signOut } from './actions';
import { useActionState } from 'react';

const initialState = {
  message: '',
};

export default function SignOutButton() {
  const [state, action] = useActionState(signOut, initialState);

  return (
    <>
      {state.message && <p>{state.message}</p>}
      {!state.message && (
        <form action={action}>
          <Button type='submit'>Sign out</Button>
        </form>
      )}
    </>
  );
}
