// This file has been removed after being moved to the modular folder.
import { Plus, Edit2, Trash2, Clock, Calendar, Users } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

interface SchedulesManagementProps {
  schedules: Schedule[];
  routes: Route[];
  accessToken: string;
  onRefresh: () => void;
}

export function SchedulesManagement({
  schedules,
  routes,
  accessToken,
  onRefresh,
}: SchedulesManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    routeId: '',
    date: '',
    departureTime: '',
    totalSeats: '',
    availableSeats: '',
  });

  // Helper to get fresh token
  const getFreshToken = async (): Promise<string> => {
    const supabase = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
    );

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new Error('Session expired. Please login again.');
    }

    return data.session.access_token;
  };

  const resetForm = () => {
    setFormData({
      routeId: '',
      date: '',
      departureTime: '',
      totalSeats: '',
      availableSeats: '',
    });
    setEditingSchedule(null);
    setShowForm(false);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      routeId: schedule.routeId,
      date: schedule.date,
      departureTime: schedule.departureTime,
      totalSeats: schedule.totalSeats.toString(),
      availableSeats: schedule.availableSeats.toString(),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get fresh token
      const token = await getFreshToken();

      const url = editingSchedule
        ? `https://${projectId}.supabase.co/functions/v1/make-server-4075ff54/schedules/${editingSchedule.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-4075ff54/schedules`;

      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          routeId: formData.routeId,
          date: formData.date,
          departureTime: formData.departureTime,
          totalSeats: parseInt(formData.totalSeats),
          availableSeats: parseInt(formData.availableSeats),
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Failed to save schedule');
      }

      resetForm();
      onRefresh();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      alert(`Gagal menyimpan jadwal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      return;
    }

    setLoading(true);

    try {
      // Get fresh token
      const token = await getFreshToken();

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4075ff54/schedules/${scheduleId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      onRefresh();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      alert(`Gagal menghapus jadwal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRouteLabel = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    return route ? `${route.origin} → ${route.destination}` : routeId;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Generate tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Kelola Jadwal</h3>
        {!showForm && (
          <Button size="medium" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Tambah Jadwal
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <h3 className="mb-4">
            {editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Rute"
              options={routes.map((route) => ({
                value: route.id,
                label: `${route.origin} → ${route.destination}`,
              }))}
              value={formData.routeId}
              onChange={(e) =>
                setFormData({ ...formData, routeId: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tanggal"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                min={minDate}
                required
              />

              <Input
                label="Jam Keberangkatan"
                type="time"
                value={formData.departureTime}
                onChange={(e) =>
                  setFormData({ ...formData, departureTime: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Total Kursi"
                type="number"
                value={formData.totalSeats}
                onChange={(e) =>
                  setFormData({ ...formData, totalSeats: e.target.value })
                }
                placeholder="Contoh: 30"
                min="1"
                required
              />

              <Input
                label="Kursi Tersedia"
                type="number"
                value={formData.availableSeats}
                onChange={(e) =>
                  setFormData({ ...formData, availableSeats: e.target.value })
                }
                placeholder="Contoh: 30"
                min="0"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Menyimpan...'
                  : editingSchedule
                  ? 'Update Jadwal'
                  : 'Tambah Jadwal'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            Belum ada jadwal tersedia
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-gray-900">
                      {getRouteLabel(schedule.routeId)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Tanggal</p>
                        <p className="text-gray-900">
                          {formatDate(schedule.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Jam</p>
                        <p className="text-gray-900">
                          {schedule.departureTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Kursi</p>
                        <p className="text-gray-900">
                          {schedule.availableSeats} / {schedule.totalSeats}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="p-3 hover:bg-primary/10 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <Edit2 className="w-5 h-5 text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
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
