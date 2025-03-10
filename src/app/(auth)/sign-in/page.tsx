import { LoginForm } from './components';
import Link from 'next/link';

export default async function Page() {

  return (
    <>
      <h1>Sign in</h1>
      <LoginForm />
      <Link href='/sign-up'>Create an account</Link>
      <Link href='/forgot-password'>Forgot password?</Link>
      <a href='sign-in/github'>Sign in with GitHub</a>
    </>
  );
}
