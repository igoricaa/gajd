// import 'server-only';

// import { cookies } from 'next/headers';
// import { decrypt } from '@/lib/auth/encryption';
// import { redirect } from 'next/navigation';
// import { cache } from 'react';

// export const verifySession = cache(async () => {
//   const token = (await cookies()).get('session')?.value;
//   const session = decrypt(token);

//   if (!session?.userId) {
//     redirect('/login');
//   }

//   return { isAuth: true, userId: session.userId };
// });
