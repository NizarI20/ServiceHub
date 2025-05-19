import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export interface ServiceProps {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  provider: {
    id: string;
    name: string;
  };
  imageUrl?: string;
  disponibilite?: boolean;
  condition?: string;
}

const ServiceCard = ({ id, title, description, price, category, provider, imageUrl, disponibilite, condition }: ServiceProps) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="w-full aspect-video bg-gray-200 overflow-hidden relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        {/* Badge de disponibilité */}
        {disponibilite !== undefined && (
          <div className="absolute top-2 right-2">
            <Badge className={disponibilite ? "bg-green-500" : "bg-red-500"}>
              {disponibilite ? "Disponible" : "Indisponible"}
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-brand-800 line-clamp-1">{title}</CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-1">
              {category}
            </CardDescription>
          </div>
          <div className="font-bold text-brand-600">${price}</div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
        
        {condition && (
          <div className="flex items-center mt-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{condition}</span>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">Provided by: {provider.name}</p>
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-col gap-2">
        <Link to={`/services/${id}`} className="w-full">
          <Button variant="default" className="w-full bg-brand-600 hover:bg-brand-700">
            View Details
          </Button>
        </Link>
        
        {disponibilite && (
          <Link to={`/services/${id}?reserve=true`} className="w-full">
            <Button variant="outline" className="w-full border-brand-600 text-brand-600 hover:bg-brand-50">
              Réserver maintenant
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
