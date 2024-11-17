import { github } from '@/lib/auth/oauth';
import { SessionFlags, setSession } from '@/lib/auth/session';
import { getUserByGithubId, createUserGithub } from '@/lib/auth/user';

import { OAuth2Tokens } from 'arctic';
import { cookies } from 'next/headers';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieStore = await cookies();
  const storedState = cookieStore.get('github_oauth_state')?.value ?? null;

  if (
    code === null ||
    state === null ||
    storedState === null ||
    state !== storedState
  ) {
    return Response.json(
      { error: 'Invalid authorization code' },
      { status: 400 }
    );
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await github.validateAuthorizationCode(code);
  } catch (error) {
    //TODO: Handle invalid code or client credentials
    return Response.json(
      { error: 'Invalid authorization code' },
      { status: 400 }
    );
  }
  const githubUserResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });
  const githubUser = await githubUserResponse.json();
  const githubUserId = githubUser.id;
  const githubUsername = githubUser.login;
  const githubEmail = githubUser.email;

  const existingUser = await getUserByGithubId(githubUserId);

  if (existingUser !== null) {
    const sessionFlags: SessionFlags = {
      twoFactorVerified: false,
    };
    await setSession(existingUser.id, sessionFlags);

    return Response.redirect('/');
  }

  const user = await createUserGithub(
    githubUserId,
    githubUsername,
    githubEmail
  );

  const sessionFlags: SessionFlags = {
    twoFactorVerified: false,
  };
  await setSession(user.id, sessionFlags);

  return Response.redirect('/');
}
