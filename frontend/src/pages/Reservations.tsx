import { useEffect, useState } from 'react';
import {
  fetchSellerReservations,
  confirmReservation,
  cancelReservation,
} from '../services/reservation';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await fetchSellerReservations();
    setReservations(data);
  };

  const handleAction = async (id: string, action: 'confirm' | 'cancel') => {
    try {
      if (action === 'confirm') await confirmReservation(id);
      else await cancelReservation(id);
      load();
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la mise à jour.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Mes réservations</h1>
      <ul className="space-y-4">
        {reservations.map(r => (
          <li key={r._id} className="p-4 border rounded shadow-sm flex justify-between items-center">
            <div>
              <p>
                <strong>{r.service.title}</strong> par {r.client.username} le {new Date(r.date).toLocaleDateString()}
              </p>
              <p>Statut : <em>{r.status}</em></p>
            </div>
            {r.status === 'pending' && (
              <div className="space-x-2">
                <button onClick={() => handleAction(r._id, 'confirm')} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Accepter</button>
                <button onClick={() => handleAction(r._id, 'cancel')} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Refuser</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}