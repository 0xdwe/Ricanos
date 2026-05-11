type EnvInput = Record<string, string | undefined>;

export type ServerEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  DATABASE_URL: string;
};

function requireValue(env: EnvInput, key: keyof ServerEnv): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function readServerEnv(env: EnvInput = process.env): ServerEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: requireValue(env, "NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requireValue(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    DATABASE_URL: requireValue(env, "DATABASE_URL"),
  };
}
