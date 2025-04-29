
'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: services } = useQuery({
    queryKey: ['services', user?.id],
    queryFn: async () => {
      const response = await api.get(user?.role === 'provider' 
        ? `/services?providerId=${user.id}` 
        : `/services/bookings?userId=${user.id}`
      );
      return response.data;
    },
    enabled: !!user,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {user?.role === 'provider' ? 'My Services' : 'My Bookings'}
      </h1>

      <div className="grid grid-cols-1 gap-6">
        {services?.map((service: any) => (
          <div key={service.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold">{service.title}</h2>
            <p className="text-gray-600 mt-2">{service.description}</p>
            <div className="mt-4 text-brand-600">${service.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
