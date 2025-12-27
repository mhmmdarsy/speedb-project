import type { Route } from '../../types';
import { Card } from '../../components/Card';
import { Ship, Clock, MapPin } from 'lucide-react';

interface RouteSelectionProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
}

export function RouteSelection({ routes, onSelectRoute }: RouteSelectionProps) {
  const activeRoutes = routes.filter(route => route.isActive);
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <Ship className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="mb-2">Pesan Tiket</h1>
        <p className="text-gray-600">Pilih rute perjalanan Anda</p>
      </div>
      
      {activeRoutes.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">Tidak ada rute tersedia saat ini</p>
        </Card>
      ) : (
        activeRoutes.map((route) => (
          <Card key={route.id} onClick={() => onSelectRoute(route)}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900">{route.origin}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-900">{route.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>{route.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">Harga per orang</p>
                  <p className="text-primary">
                    Rp {route.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="px-6 py-2 bg-primary/10 rounded-lg text-primary">
                  Pilih →
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
