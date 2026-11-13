// Shape of the sealed admin session (README 8.4), shared by server and app.
// Lives in shared/ so every Nuxt TypeScript project picks it up.
declare module '#auth-utils' {
  interface User {
    role: 'super_admin' | 'guardian';
    groupId: string | null;
    groupSlug: string | null;
  }
  interface UserSession {
    loggedInAt?: string;
  }
}

export {};
