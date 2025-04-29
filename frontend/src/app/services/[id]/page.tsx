
import api from "@/lib/api";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function ServiceDetails() {
  const { id } = useParams();
  
  const { data: service, isError } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      try {
        const response = await api.get(`/services/${id}`);
        return response.data;
      } catch (error) {
        return null;
      }
    }
  });
  
  if (isError || (service === null)) {
    return <Navigate to="/404" />;
  }

  if (!service) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {service.imageUrl && (
            <div className="w-full aspect-video">
              <img 
                src={service.imageUrl} 
                alt={service.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="text-brand-600 text-2xl font-bold">${service.price}</div>
              <div className="text-gray-500">Category: {service.category}</div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-600">{service.description}</p>
            </div>
            
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">About the Provider</h2>
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-medium">{service.provider?.name}</h3>
                  <p className="text-gray-500">Professional Service Provider</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
