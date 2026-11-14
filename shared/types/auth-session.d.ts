// Shape of the sealed session (README 8.4, 22.5), shared by server
// and app. Lives in shared/ so every Nuxt TypeScript project picks it up.
// The cookie only points to a session row; the role is recomputed from
// the account on every request.
declare module '#auth-utils' {
  interface User {
    role: 'super_admin' | 'guardian' | 'member';
    accountId: string;
    sessionId: string;
  }
  interface UserSession {
    loggedInAt?: string;
  }
}

export {};
