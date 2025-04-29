
import ServiceCard from "@/components/ServiceCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

async function getServices() {
  const response = await api.get('/services');
  return response.data;
}

export default async function Services() {
  const services = await getServices();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available XXX</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service: any) => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </div>
    </div>
  );
}
