import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';

// KV Store utilities inline to avoid import issues
const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const KV_TABLE = 'kv_store_4075ff54';

const kvStore = {
  async get(key: string) {
    const { data, error } = await supabaseClient
      .from(KV_TABLE)
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    return data.value;
  },

  async set(key: string, value: any) {
    const { error } = await supabaseClient
      .from(KV_TABLE)
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw error;
  },

  async del(key: string) {
    const { error } = await supabaseClient
      .from(KV_TABLE)
      .delete()
      .eq('key', key);

    if (error) throw error;
  },

  async getByPrefix(prefix: string) {
    const { data, error } = await supabaseClient
      .from(KV_TABLE)
      .select('value')
      .like('key', `${prefix}%`);

    if (error) return [];
    return data.map((row) => row.value);
  },
};

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ============= AUTH ROUTES =============

app.post('/make-server-4075ff54/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Error during admin signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ============= ROUTES MANAGEMENT =============

app.get('/make-server-4075ff54/routes', async (c) => {
  try {
    const routes = await kvStore.getByPrefix('route:');
    return c.json({ routes });
  } catch (error) {
    console.log(`Error fetching routes: ${error}`);
    return c.json({ error: 'Failed to fetch routes' }, 500);
  }
});

app.post('/make-server-4075ff54/routes', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      console.log('Routes POST: No access token provided');
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError) {
      console.log(`Routes POST: Auth error - ${authError.message}`);
      return c.json(
        { error: `Authorization failed: ${authError.message}` },
        401,
      );
    }

    if (!user?.id) {
      console.log('Routes POST: No user ID found in token');
      return c.json({ error: 'Unauthorized - Invalid user' }, 401);
    }

    const routeData = await c.req.json();
    console.log('Routes POST: Creating route with data:', routeData);

    const routeId = `route:${Date.now()}`;

    await kvStore.set(routeId, {
      id: routeId,
      ...routeData,
      createdAt: new Date().toISOString(),
    });

    console.log(`Routes POST: Successfully created route ${routeId}`);
    return c.json({ success: true, id: routeId });
  } catch (error) {
    console.log(`Routes POST: Error creating route - ${error}`);
    return c.json(
      {
        error: `Failed to create route: ${error.message || error}`,
      },
      500,
    );
  }
});

app.put('/make-server-4075ff54/routes/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const routeId = c.req.param('id');
    const routeData = await c.req.json();

    const existingRoute = await kvStore.get(routeId);
    if (!existingRoute) {
      return c.json({ error: 'Route not found' }, 404);
    }

    await kvStore.set(routeId, {
      ...existingRoute,
      ...routeData,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating route: ${error}`);
    return c.json({ error: 'Failed to update route' }, 500);
  }
});

app.delete('/make-server-4075ff54/routes/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const routeId = c.req.param('id');
    await kvStore.del(routeId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting route: ${error}`);
    return c.json({ error: 'Failed to delete route' }, 500);
  }
});

// ...existing code...
