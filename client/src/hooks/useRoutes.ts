import { useState } from 'react';
import type { Route } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);

  const fetchRoutes = async () => {
    const res = await fetch(`${API_BASE_URL}/routes`);
    const data = await res.json();

    setRoutes(
      (data.routes || []).map((r: Route & { is_active?: boolean }) => ({
        ...r,
        isActive: r.is_active,
      })),
    );
  };

  return { routes, fetchRoutes };
}
