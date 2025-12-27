import { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/Input';
import type { Route } from '../../../types';

const API_BASE_URL = 'http://localhost:3000/api';

interface RoutesManagementProps {
  routes: Route[];
  onRefresh: () => void;
}

export function RoutesManagement({ routes, onRefresh }: RoutesManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    price: '',
    duration: '',
    isActive: true,
  });

  // Helper to get fresh token
  const getFreshToken = async (): Promise<string> => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new Error('Session expired. Please login again.');
    }

    return data.session.access_token;
  };

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: '',
      price: '',
      duration: '',
      isActive: true,
    });
    setEditingRoute(null);
    setShowForm(false);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      origin: route.origin,
      destination: route.destination,
      price: route.price.toString(),
      duration: route.duration,
      isActive: route.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ambil access token Supabase (INI BENAR)
      const token = await getFreshToken();

      const url = editingRoute
        ? `${API_BASE_URL}/admin/routes/${editingRoute.id}`
        : `${API_BASE_URL}/admin/routes`;

      const method = editingRoute ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // JWT user
        },
        body: JSON.stringify({
          origin: formData.origin,
          destination: formData.destination,
          price: Number(formData.price),
          duration: formData.duration,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));

        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Failed to save route');
      }

      resetForm();
      onRefresh();
    } catch (error: unknown) {
      console.error('Error saving route:', error);
      alert(
        `Gagal menyimpan rute: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rute ini?')) {
      return;
    }

    setLoading(true);

    try {
      // Get fresh token
      const token = await getFreshToken();

      const response = await fetch(`${API_BASE_URL}/admin/routes/${routeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete route');
      }

      onRefresh();
    } catch (error: unknown) {
      console.error('Error deleting route:', error);
      alert(
        `Gagal menghapus rute: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Kelola Rute</h3>
        {!showForm && (
          <Button className="flex items-center" size="medium" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            <p>Tambah Rute</p>
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <h3 className="mb-4">
            {editingRoute ? 'Edit Rute' : 'Tambah Rute Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Asal"
                type="text"
                value={formData.origin}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
                placeholder="Contoh: Pelabuhan A"
                required
              />

              <Input
                label="Tujuan"
                type="text"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
                placeholder="Contoh: Pelabuhan B"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Harga (Rp)"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Contoh: 150000"
                required
              />

              <Input
                label="Durasi"
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="Contoh: 2 jam"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-6 h-6 rounded border-2 border-gray-300"
              />
              <label
                htmlFor="isActive"
                className="text-gray-900 cursor-pointer"
              >
                Rute aktif (tampilkan di pemesanan)
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Menyimpan...'
                  : editingRoute
                  ? 'Update Rute'
                  : 'Tambah Rute'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Routes List */}
      {routes.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            Belum ada rute tersedia
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <Card key={route.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-gray-900">
                        {route.origin} → {route.destination}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {route.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Harga</p>
                      <p className="text-primary">
                        Rp {route.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm
                          ${
                            route.isActive
                              ? 'bg-success/10 text-success'
                              : 'bg-gray-200 text-gray-600'
                          }
                        `}
                      >
                        {route.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    aria-label="Edit route"
                    title="Edit route"
                    onClick={() => handleEdit(route)}
                    className="p-3 hover:bg-primary/10 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <Edit2 className="w-5 h-5 text-primary" />
                  </button>
                  <button
                    aria-label="Delete route"
                    title="Delete route"
                    onClick={() => handleDelete(route.id)}
                    className="p-3 hover:bg-error/10 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <Trash2 className="w-5 h-5 text-error" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
