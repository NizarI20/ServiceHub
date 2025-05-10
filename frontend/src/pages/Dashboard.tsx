import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { Calendar, Clock, Package, CalendarClock, User, Settings, BadgeCheck, History, DollarSign, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

// Updated interfaces to match backend data structure
interface Booking {
  _id: string;
  service: {
    _id: string;
    title: string;
    price: number;
    imageUrl?: string;
    provider?: {
      _id: string;
      name: string;
      email: string;
      profileImage?: string;
    }
  };
  client: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface ServiceListing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  active: boolean;
  provider: string;
}

interface DashboardMetrics {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalServices: number;
  activeServices: number;
  totalRevenue: number;
  thisMonthRevenue: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalServices: 0,
    activeServices: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0
  });

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, isLoading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Dashboard mounted, authenticated user:', user);
      fetchDashboardData();
    } else {
      // If not authenticated, use mock data
      console.log('Not authenticated, using mock data');
      useMockData();
    }
  }, [isAuthenticated, user]);

  // Function to fetch dashboard data from the API
  const fetchDashboardData = async () => {
    if (!isAuthenticated || !user) {
      useMockData();
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching data for user:', user);
      
      if (user.role === 'provider') {
        // Fetch provider's services
        const servicesResponse = await api.get('/services', {
          params: { provider: user.id }
        });
        setServices(servicesResponse.data || []);
        console.log('Provider services:', servicesResponse.data);
        
        // Fetch provider's reservations
        const reservationsResponse = await api.get('/reservations/seller', {
          params: { sellerId: user.id }
        });
        setBookings(reservationsResponse.data || []);
        console.log('Provider reservations:', reservationsResponse.data);
        
        // Calculate metrics for provider
        calculateProviderMetrics(servicesResponse.data || [], reservationsResponse.data || []);
      } else if (user.role === 'client') {
        console.log('Fetching client reservations for client ID:', user.id);
        
        try {
          // Use a simpler approach with direct URL to avoid query parameter issues
          const clientReservationsUrl = `/reservations/client?clientId=${user.id}`;
          console.log('Client reservations URL:', clientReservationsUrl);
          
          const reservationsResponse = await api.get(clientReservationsUrl);
          console.log('Client reservations response:', reservationsResponse);
          
          if (reservationsResponse.data && Array.isArray(reservationsResponse.data)) {
            setBookings(reservationsResponse.data);
            // Calculate metrics for client
            calculateClientMetrics(reservationsResponse.data);
          } else {
            console.error('Invalid response format for client reservations:', reservationsResponse.data);
            throw new Error('Invalid response format');
          }
        } catch (clientError: any) {
          console.error('Error fetching client reservations:', clientError);
          console.error('Error details:', clientError.response?.data || clientError.message);
          
          // If we get a specific error about ObjectId, we can handle it here
          if (clientError.response?.data?.error?.includes('ObjectId')) {
            console.log('ObjectId error detected, using mock data');
            useMockData();
            return;
          }
          
          throw clientError; // Re-throw to trigger the fallback
        }
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load dashboard data. Using mock data instead.');
      setIsLoading(false);
      
      // Fallback to mock data if API fails
      useMockData();
    }
  };

  // Calculate metrics for provider dashboard
  const calculateProviderMetrics = (services: ServiceListing[], bookings: Booking[]) => {
    const totalServices = services.length;
    const activeServices = services.filter(s => s.active).length;
    
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    // Calculate revenue from completed and confirmed bookings
    const totalRevenue = bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, booking) => sum + booking.service.price, 0);
    
    // Calculate this month's revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthRevenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return (
          (b.status === 'completed' || b.status === 'confirmed') &&
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, booking) => sum + booking.service.price, 0);
    
    setMetrics({
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalServices,
      activeServices,
      totalRevenue,
      thisMonthRevenue
    });
  };

  // Calculate metrics for client dashboard
  const calculateClientMetrics = (bookings: Booking[]) => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    // Calculate total spent on services
    const totalSpent = bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, booking) => sum + booking.service.price, 0);
    
    // Calculate this month's spending
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthSpent = bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return (
          (b.status === 'completed' || b.status === 'confirmed') &&
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, booking) => sum + booking.service.price, 0);
    
    setMetrics({
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalServices: 0, // Not applicable for clients
      activeServices: 0, // Not applicable for clients
      totalRevenue: totalSpent, // For clients, this is total spent
      thisMonthRevenue: thisMonthSpent // For clients, this is this month's spending
    });
  };

  // Fallback to mock data if API fails
  const useMockData = () => {
    // Mock bookings data
    const mockBookings: Booking[] = [
      {
        _id: 'b1',
        service: {
          _id: '1',
          title: 'Professional Web Development',
          price: 799,
          imageUrl: '/placeholder.svg',
          provider: {
            _id: 'p1',
            name: 'John Developer',
            email: 'john@example.com',
            profileImage: '/placeholder.svg'
          }
        },
        client: {
          _id: 'c1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          profileImage: '/placeholder.svg'
        },
        date: '2025-05-15',
        status: 'confirmed',
        createdAt: '2025-05-01'
      },
      {
        _id: 'b2',
        service: {
          _id: '2',
          title: 'House Cleaning Service',
          price: 120,
          imageUrl: '/placeholder.svg',
          provider: {
            _id: 'p2',
            name: 'Clean Home Inc.',
            email: 'clean@example.com'
          }
        },
        client: {
          _id: 'c2',
          name: 'Bob Smith',
          email: 'bob@example.com'
        },
        date: '2025-05-22',
        status: 'pending',
        createdAt: '2025-05-02'
      },
      {
        _id: 'b3',
        service: {
          _id: '3',
          title: 'Plumbing Repair',
          price: 95,
          imageUrl: '/placeholder.svg',
          provider: {
            _id: 'p3',
            name: 'Mike\'s Plumbing',
            email: 'mike@example.com'
          }
        },
        client: {
          _id: 'c3',
          name: 'Charlie Brown',
          email: 'charlie@example.com'
        },
        date: '2025-04-30',
        status: 'completed',
        createdAt: '2025-04-25'
      }
    ];
    
    // Mock services data (for providers)
    const mockServices: ServiceListing[] = [
      {
        _id: 's1',
        title: 'Frontend Development',
        description: 'Modern frontend development using React, Vue, or Angular',
        price: 650,
        category: 'Web Design',
        imageUrl: '/placeholder.svg',
        active: true,
        provider: user?.id || 'p1'
      },
      {
        _id: 's2',
        title: 'Full Stack Development',
        description: 'Complete web application development with front and back end',
        price: 950,
        category: 'Web Design',
        imageUrl: '/placeholder.svg',
        active: true,
        provider: user?.id || 'p1'
      },
      {
        _id: 's3',
        title: 'Mobile App Development',
        description: 'iOS and Android app development using React Native',
        price: 1200,
        category: 'Mobile Development',
        imageUrl: '/placeholder.svg',
        active: false,
        provider: user?.id || 'p1'
      }
    ];
    
    setBookings(mockBookings);
    
    if (user?.role === 'provider') {
      setServices(mockServices);
      calculateProviderMetrics(mockServices, mockBookings);
    } else {
      calculateClientMetrics(mockBookings);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.patch(`/reservations/${bookingId}/status`, { status: 'cancelled' });
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleToggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/services/${serviceId}`, { active: !currentStatus });
      
      // Update local state
      setServices(prevServices =>
        prevServices.map(service =>
          service._id === serviceId
            ? { ...service, active: !service.active }
            : service
        )
      );
      
      const service = services.find(s => s._id === serviceId);
      toast.success(`${service?.title} is now ${!currentStatus ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Failed to update service status:', error);
      toast.error('Failed to update service status');
    }
  };

  const handleUpdateReservationStatus = async (reservationId: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await api.patch(`/reservations/${reservationId}/status`, { status: newStatus });
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === reservationId 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );
      
      toast.success(`Booking ${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'cancelled' ? 'cancelled' : 'completed'} successfully`);
    } catch (error) {
      console.error(`Failed to ${newStatus} booking:`, error);
      toast.error(`Failed to ${newStatus} booking`);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return null; // Redirect will happen via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              {user?.role === 'provider' 
                ? 'Manage your services and bookings' 
                : 'Manage your service bookings'}
            </p>
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
                  <p className="text-sm text-brand-600 mt-1">
                    {user?.role === 'provider' ? 'Service Provider' : 'Client'}
                  </p>
                </div>
              </div>
              
              <div className="flex-grow"></div>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Settings size={16} />
                Account Settings
              </Button>
            </div>
          </div>
          
          {/* Metrics Section - Different metrics for providers and clients */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Bookings Metric */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {user?.role === 'provider' ? 'Total Bookings' : 'My Bookings'}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold">{metrics.totalBookings}</p>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <CalendarClock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Pending: {metrics.pendingBookings}
                    </span>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Completed: {metrics.completedBookings}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Services Metric - Only for providers */}
            {user?.role === 'provider' ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Services</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold">{metrics.totalServices}</p>
                      )}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Active: {metrics.activeServices}
                      </span>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive: {metrics.totalServices - metrics.activeServices}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold">{metrics.pendingBookings + (bookings.filter(b => b.status === 'confirmed').length)}</p>
                      )}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending: {metrics.pendingBookings}
                      </span>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Confirmed: {bookings.filter(b => b.status === 'confirmed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Revenue/Spent Metric */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {user?.role === 'provider' ? 'Total Revenue' : 'Total Spent'}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold">${metrics.totalRevenue}</p>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    From {metrics.completedBookings + bookings.filter(b => b.status === 'confirmed').length} bookings
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* This Month's Revenue/Spent */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {user?.role === 'provider' ? 'This Month' : 'This Month Spent'}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold">${metrics.thisMonthRevenue}</p>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Different tabs for providers and clients */}
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
                    <TabsTrigger value="history" className="px-6">
                      <History className="mr-2 h-4 w-4" />
                      Booking History
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
            
            {/* Provider-specific tabs */}
            {user?.role === 'provider' && (
              <>
                <TabsContent value="services">
                  {/* Services tab content */}
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
                        <Card key={service._id}>
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
                              <span className="text-gray-600">Bookings: <span className="font-medium">{0}</span></span>
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
                              onClick={() => handleToggleServiceStatus(service._id, service.active)}
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
                
                <TabsContent value="requests">
                  {/* Booking requests tab content */}
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
                
                <TabsContent value="history">
                  {/* Booking history tab content */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {isLoading || isHistoryLoading ? (
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
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.map((booking) => (
                              <tr key={booking._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-3">
                                      <AvatarImage src={booking.client.profileImage} />
                                      <AvatarFallback>{booking.client.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm font-medium text-gray-900">{booking.client.name}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{booking.service.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-500">Booked: {new Date(booking.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">${booking.service.price}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
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
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {booking.status === 'pending' && (
                                    <div className="flex space-x-2">
                                      <Button 
                                        size="sm"
                                        variant="default"
                                        className="bg-brand-600 hover:bg-brand-700"
                                        onClick={() => handleUpdateReservationStatus(booking._id, 'confirmed')}
                                      >
                                        Confirm
                                      </Button>
                                      <Button 
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleUpdateReservationStatus(booking._id, 'cancelled')}
                                      >
                                        Decline
                                      </Button>
                                    </div>
                                  )}
                                  {booking.status === 'confirmed' && (
                                    <Button 
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleUpdateReservationStatus(booking._id, 'cancelled')}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  {(booking.status === 'completed' || booking.status === 'cancelled') && (
                                    <span className="text-gray-500">No actions available</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <History className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No booking history</h3>
                        <p className="mt-1 text-gray-500">When clients book your services, their bookings will appear here.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
            
            {/* Client-specific tabs */}
            {user?.role === 'client' && (
              <TabsContent value="bookings">
                {/* Client bookings tab content */}
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
                          key={booking._id}
                          className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={booking.service.provider?.profileImage} />
                            <AvatarFallback>{booking.service.provider?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-grow">
                            <h4 className="font-medium">{booking.service.title}</h4>
                            <div className="text-sm text-gray-600">
                              <span>Provider: {booking.service.provider?.name}</span>
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
                            <div className="font-medium">${booking.service.price}</div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/services/${booking.service._id}`)}
                            >
                              View
                            </Button>
                            {booking.status === 'pending' || booking.status === 'confirmed' ? (
                              <Button 
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelBooking(booking._id)}
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
