import { getCurrentSession } from '@/lib/auth/session';
import { encodeBase64 } from '@oslojs/encoding';
import { createTOTPKeyURI } from '@oslojs/otp';
import { renderSVG } from 'uqr';
import { redirect } from 'next/navigation';
import { TwoFactorSetUpForm } from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const { session, user } = await getCurrentSession();
  if (session === null) {
    return redirect('/sign-in');
  }
  if (!user.emailVerified) {
    return redirect('/verify-email');
  }
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect('/2fa');
  }

  const totpKey = new Uint8Array(20);
  crypto.getRandomValues(totpKey);
  const encodedTOTPKey = encodeBase64(totpKey);
  const keyURI = createTOTPKeyURI('Demo', user.username, totpKey, 30, 6);
  const qrcode = renderSVG(keyURI);

  return (
    <>
      <h1>Set up two-factor authentication</h1>
      <div
        style={{
          width: '200px',
          height: '200px',
        }}
        dangerouslySetInnerHTML={{
          __html: qrcode,
        }}
      ></div>
      <TwoFactorSetUpForm encodedTOTPKey={encodedTOTPKey} />
    </>
  );
}
