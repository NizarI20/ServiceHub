
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { Calendar, Clock, Package, CalendarClock, User, Settings, BadgeCheck } from 'lucide-react';
import api from '@/lib/api';

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  providerImage?: string;
  price: number;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface ServiceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  active: boolean;
  bookings: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceListing[]>([]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, isLoading]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setIsLoading(true);
        
        // In a real app, you would fetch from the API
        // const bookingsResponse = await api.get('/bookings');
        // const servicesResponse = await api.get('/services/provider');
        
        // For demo purposes, mock data
        setTimeout(() => {
          // Mock bookings data
          const mockBookings: Booking[] = [
            {
              id: 'b1',
              serviceId: '1',
              serviceName: 'Professional Web Development',
              providerName: 'John Developer',
              providerImage: '/placeholder.svg',
              price: 799,
              date: '2025-05-15',
              status: 'confirmed'
            },
            {
              id: 'b2',
              serviceId: '2',
              serviceName: 'House Cleaning Service',
              providerName: 'Clean Home Inc.',
              price: 120,
              date: '2025-05-22',
              status: 'pending'
            },
            {
              id: 'b3',
              serviceId: '3',
              serviceName: 'Plumbing Repair',
              providerName: 'Mike\'s Plumbing',
              price: 95,
              date: '2025-04-30',
              status: 'completed'
            }
          ];
          
          // Mock services data (for providers)
          const mockServices: ServiceListing[] = [
            {
              id: 's1',
              title: 'Frontend Development',
              description: 'Modern frontend development using React, Vue, or Angular',
              price: 650,
              category: 'Web Design',
              imageUrl: '/placeholder.svg',
              active: true,
              bookings: 8
            },
            {
              id: 's2',
              title: 'Full Stack Development',
              description: 'Complete web application development with front and back end',
              price: 950,
              category: 'Web Design',
              imageUrl: '/placeholder.svg',
              active: true,
              bookings: 12
            },
            {
              id: 's3',
              title: 'Mobile App Development',
              description: 'iOS and Android app development using React Native',
              price: 1200,
              category: 'Mobile Development',
              imageUrl: '/placeholder.svg',
              active: false,
              bookings: 3
            }
          ];
          
          setBookings(mockBookings);
          setServices(mockServices);
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isAuthenticated, user]);

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      )
    );
    
    toast.success('Booking cancelled successfully');
  };

  const handleToggleServiceStatus = (serviceId: string) => {
    setServices(prevServices =>
      prevServices.map(service =>
        service.id === serviceId
          ? { ...service, active: !service.active }
          : service
      )
    );
    
    const service = services.find(s => s.id === serviceId);
    toast.success(`${service?.title} is now ${service?.active ? 'inactive' : 'active'}`);
  };

  if (!isAuthenticated && !isLoading) {
    return null; // Redirect will happen via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your services and bookings</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
                  <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              
              <div className="flex-grow"></div>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Settings size={16} />
                Account Settings
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue={user?.role === 'provider' ? 'services' : 'bookings'}>
            <div className="flex justify-between items-center mb-6">
              <TabsList className="w-full md:w-auto">
                {user?.role === 'client' && (
                  <TabsTrigger value="bookings" className="px-6">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Bookings
                  </TabsTrigger>
                )}
                
                {user?.role === 'provider' && (
                  <>
                    <TabsTrigger value="services" className="px-6">
                      <Package className="mr-2 h-4 w-4" />
                      My Services
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="px-6">
                      <CalendarClock className="mr-2 h-4 w-4" />
                      Booking Requests
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
              
              {user?.role === 'provider' && (
                <Button className="hidden md:flex bg-brand-600 hover:bg-brand-700">
                  + Add New Service
                </Button>
              )}
            </div>
            
            {user?.role === 'provider' && (
              <TabsContent value="services">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, index) => (
                      <Card key={index}>
                        <CardHeader className="p-0">
                          <Skeleton className="h-48 w-full rounded-t-lg" />
                        </CardHeader>
                        <CardContent className="p-4">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-4" />
                          <Skeleton className="h-16 w-full" />
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Skeleton className="h-10 w-full" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <Card key={service.id}>
                        <CardHeader className="p-0">
                          {service.imageUrl ? (
                            <img 
                              src={service.imageUrl} 
                              alt={service.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                              <span className="text-gray-400">No image available</span>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <CardTitle className="text-lg">{service.title}</CardTitle>
                              <CardDescription>{service.category}</CardDescription>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              service.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{service.description}</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Price: <span className="font-medium">${service.price}</span></span>
                            <span className="text-gray-600">Bookings: <span className="font-medium">{service.bookings}</span></span>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                          >
                            Edit
                          </Button>
                          <Button 
                            variant={service.active ? "destructive" : "default"}
                            size="sm"
                            className={`flex-1 ${!service.active ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
                            onClick={() => handleToggleServiceStatus(service.id)}
                          >
                            {service.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No services yet</h3>
                    <p className="mt-1 text-gray-500">Start adding your services to get bookings.</p>
                    <div className="mt-6">
                      <Button className="bg-brand-600 hover:bg-brand-700">
                        + Add New Service
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            )}
            
            {user?.role === 'provider' && (
              <TabsContent value="requests">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {isLoading ? (
                    <div className="p-6">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-grow">
                            <Skeleton className="h-5 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-10 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <User className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No booking requests</h3>
                      <p className="mt-1 text-gray-500">When clients book your services, they'll appear here.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
            
            {user?.role === 'client' && (
              <TabsContent value="bookings">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {isLoading ? (
                    <div className="p-6">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-grow">
                            <Skeleton className="h-5 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-10 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : bookings.length > 0 ? (
                    <div>
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id}
                          className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={booking.providerImage} />
                            <AvatarFallback>{booking.providerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-grow">
                            <h4 className="font-medium">{booking.serviceName}</h4>
                            <div className="text-sm text-gray-600">
                              <span>Provider: {booking.providerName}</span>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {new Date(booking.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 md:flex-col md:items-end">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <div className="font-medium">${booking.price}</div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/services/${booking.serviceId}`)}
                            >
                              View
                            </Button>
                            {booking.status === 'pending' || booking.status === 'confirmed' ? (
                              <Button 
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Cancel
                              </Button>
                            ) : null}
                            {booking.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarClock className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings yet</h3>
                      <p className="mt-1 text-gray-500">Browse services and make your first booking.</p>
                      <div className="mt-6">
                        <Button 
                          className="bg-brand-600 hover:bg-brand-700"
                          onClick={() => navigate('/services')}
                        >
                          Browse Services
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
