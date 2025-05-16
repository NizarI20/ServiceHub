import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, Tag, Award, ThumbsUp, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import api from '@/lib/api';
import { ReservationForm } from '@/components/ReservationForm';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  category: string;
  provider: {
    id: string;
    name: string;
    rating?: number;
    completedJobs?: number;
    profileImage?: string;
  };
  imageUrl?: string;
  location?: string;
  duration?: string;
  experience?: string;
  features?: string[];
  reviews?: Review[];
  disponibilite: boolean;
  condition: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userImage?: string;
}

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get(`/services/${id}`);
        console.log('Fetched service detail:', response.data);
  
        const data = response.data;
        const category = api.get(`/categories/${data.categorie}`);
        const categoryData = await category;
        const categoryName = categoryData.data.nom; 
        const createdBy = api.get(`/users/${data.createdBy}`);
        const createdByData = await createdBy;
        const createdByName = createdByData.data.name;
        const createdByRating = createdByData.data.rating;
        const createdByCompletedJobs = createdByData.data.completedJobs;
        const createdByProfileImage = createdByData.data.profileImage;
        const createdById = createdByData.data._id;
        
        
        const mappedService: ServiceDetail = {
          id: data._id,
          title: data.titre,
          description: data.description,
          longDescription: data.description, // Using description as longDescription
          price: data.prix,
          category: categoryName || 'Uncategorized',
          provider: {
            id: data.createdBy?._id || '',
            name: data.createdBy?.name || 'Unknown',
            rating: data.createdBy?.rating,
            completedJobs: data.createdBy?.completedJobs,
            profileImage: data.createdBy?.profileImage,
          },
          imageUrl: data.featuredimg,
          disponibilite: data.disponibilite,
          condition: data.condition,
          location: 'Remote / Nationwide',
          duration: 'Standard delivery time',
          experience: 'Professional service',
          features: [
            'Quality guaranteed',
            'Professional service',
            data.condition,
            data.disponibilite ? 'Available now' : 'Currently unavailable'
          ],
          reviews: []
        };
  
        setService(mappedService);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [id]);

  const handleBookService = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book this service');
      navigate('/login');
      return;
    }
    
    setBookingLoading(true);
    
    try {
      await api.post('/bookings', { serviceId: id });
      toast.success('Service booked successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to book service. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-80 w-full rounded-lg mb-6" />
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {error || 'Service not found'}
            </h2>
            <Button onClick={() => navigate('/services')}>
              Back to Services
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      
      <div className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                {service.imageUrl ? (
                  <img 
                    src={service.imageUrl} 
                    alt={service.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 md:h-80 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
              
              <div className="flex items-center gap-4 mb-6 text-sm">
                <div className="flex items-center text-gray-600">
                  <Tag size={16} className="mr-1" />
                  {service.category}
                </div>
                {service.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-1" />
                    {service.location}
                  </div>
                )}
                {service.duration && (
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-1" />
                    {service.duration}
                  </div>
                )}
              </div>
              
              <div className="mb-8">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="text-gray-700">
                    <p className="mb-4">{service.longDescription || service.description}</p>
                    {service.experience && (
                      <div className="flex items-start mt-6">
                        <div className="mr-2 mt-1">
                          <Award size={18} className="text-brand-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Experience</h3>
                          <p className="text-sm text-gray-600">{service.experience}</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="features">
                    <ul className="space-y-2">
                      {service.features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle size={18} className="mr-2 text-brand-600 mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    {service.reviews && service.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {service.reviews.map(review => (
                          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                            <div className="flex items-start">
                              <Avatar className="h-10 w-10 mr-4">
                                <AvatarImage src={review.userImage} />
                                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium">{review.userName}</h4>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {new Date(review.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <ThumbsUp 
                                      key={i} 
                                      size={14} 
                                      className={`mr-0.5 ${
                                        i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No reviews yet.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">${service.price}</CardTitle>
                  <CardDescription>
                    {service.category === 'Cleaning' || service.category === 'Home Repair' 
                      ? 'Per service' 
                      : 'Starting price'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={service.provider.profileImage} />
                      <AvatarFallback>{service.provider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{service.provider.name}</h4>
                      <div className="flex items-center mt-1">
                        {service.provider.rating && (
                          <div className="flex items-center text-sm">
                            <ThumbsUp size={14} className="mr-1 text-yellow-500 fill-yellow-500" />
                            <span>{service.provider.rating}</span>
                            <span className="mx-2">•</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-600">
                          {service.provider.completedJobs} jobs completed
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-b border-gray-100 py-4">
                    <h4 className="font-medium mb-2">About this service</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      {service.duration && (
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          <span>Delivery time: {service.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <CheckCircle size={16} className="mr-2" />
                        <span>Satisfaction guaranteed</span>
                      </div>
                    </div>
              </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  {isAuthenticated ? (
                    <ReservationForm 
                      serviceId={service.id}
                      serviceName={service.title}
                      price={service.price}
                    />
                  ) : (
                    <Button 
                      className="w-full bg-brand-600 hover:bg-brand-700"
                      onClick={() => navigate('/login')}
                    >
                      Se connecter pour réserver
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
