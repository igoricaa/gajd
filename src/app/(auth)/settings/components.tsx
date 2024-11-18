'use client';

import { useActionState } from 'react';
import { updateEmailAction, updatePasswordAction } from './actions';

const initialUpdatePasswordState = {
  message: '',
};

export function UpdatePasswordForm() {
  const [state, action] = useActionState(
    updatePasswordAction,
    initialUpdatePasswordState
  );

  return (
    <form action={action}>
      <label htmlFor='form-password.password'>Current password</label>
      <input
        type='password'
        id='form-email.password'
        name='password'
        autoComplete='current-password'
        required
      />
      <br />
      <label htmlFor='form-password.new-password'>New password</label>
      <input
        type='password'
        id='form-password.new-password'
        name='new_password'
        autoComplete='new-password'
        required
      />
      <br />
      <button>Update</button>
      <p>{state.message}</p>
    </form>
  );
}

const initialUpdateFormState = {
  message: '',
};

export function UpdateEmailForm() {
  const [state, action] = useActionState(
    updateEmailAction,
    initialUpdateFormState
  );

  return (
    <form action={action}>
      <label htmlFor='form-email.email'>New email</label>
      <input type='email' id='form-email.email' name='email' required />
      <br />
      <button>Update</button>
      <p>{state.message}</p>
    </form>
  );
}
