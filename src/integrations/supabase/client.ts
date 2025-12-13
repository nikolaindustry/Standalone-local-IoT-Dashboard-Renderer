// Standalone Supabase client stub
// This is a minimal stub that provides no-op implementations for standalone mode
// In standalone mode, authentication and database features are disabled

// Mock auth response
const mockAuthResponse = {
  data: { session: null, user: null },
  error: null
};

// Create chainable query builder
const createQueryBuilder = () => {
  const builder: any = {
    select: (columns?: string) => builder,
    eq: (column: string, value: any) => builder,
    neq: (column: string, value: any) => builder,
    gt: (column: string, value: any) => builder,
    gte: (column: string, value: any) => builder,
    lt: (column: string, value: any) => builder,
    lte: (column: string, value: any) => builder,
    like: (column: string, pattern: string) => builder,
    ilike: (column: string, pattern: string) => builder,
    is: (column: string, value: any) => builder,
    in: (column: string, values: any[]) => builder,
    order: (column: string, options?: any) => builder,
    limit: (count: number) => builder,
    range: (from: number, to: number) => builder,
    single: async () => ({ data: null, error: { message: 'Database features disabled in standalone mode' } }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: async (resolve: any) => resolve({ data: [], error: null }),
  };
  return builder;
};

// Mock Supabase client with no-op methods
export const supabase = {
  auth: {
    getSession: async () => mockAuthResponse,
    getUser: async () => ({ data: { user: null }, error: null }),
    signIn: async () => mockAuthResponse,
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: (table: string) => {
    const builder = createQueryBuilder();
    return {
      ...builder,
      insert: async (data: any) => ({ data: null, error: { message: 'Database features disabled in standalone mode' } }),
      update: async (data: any) => builder,
      delete: async () => builder,
      upsert: async (data: any) => ({ data: null, error: { message: 'Database features disabled in standalone mode' } }),
    };
  },
  rpc: async (fnName: string, params?: any) => ({
    data: null,
    error: { message: 'RPC features disabled in standalone mode' },
  }),
  channel: (channelName: string) => ({
    on: (event: string, callback: any) => ({
      subscribe: () => ({
        unsubscribe: () => {},
      }),
    }),
  }),
  removeChannel: (channel: any) => {},
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => ({ data: null, error: { message: 'Storage features disabled in standalone mode' } }),
      download: async (path: string) => ({ data: null, error: { message: 'Storage features disabled in standalone mode' } }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
      remove: async (paths: string[]) => ({ data: null, error: { message: 'Storage features disabled in standalone mode' } }),
    }),
  },
  functions: {
    invoke: async (fnName: string, options?: any) => ({
      data: null,
      error: { message: 'Edge functions disabled in standalone mode' },
    }),
  },
};

console.log('[Standalone Mode] Supabase features are disabled. Running in offline mode.');
