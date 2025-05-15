import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceCard, { ServiceProps } from '@/components/ServiceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import api from '@/lib/api';

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<ServiceProps[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('default');
  
  
  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch categories
        const categoriesResponse = await api.get('/categories');
        const categoryNames = categoriesResponse.data.map((category: any) => category.nom);
        setCategories(['All Categories', ...categoryNames]);

        // Fetch services
        const response = await api.get('/services');
        console.log('Fetched services:', response.data);

        // Map the services to match the ServiceProps interface
        const mappedServices = response.data.map((service: any) => {
          console.log('Processing service:', service);
          return {
            id: service._id,
            title: service.titre || '',
            description: service.description || '',
            price: service.prix || 0,
            category: service.categorie?.nom || 'Uncategorized',
            provider: {
              id: service.createdBy?._id || '',
              name: service.createdBy?.name || 'Unknown Provider',
            },
            imageUrl: service.featuredimg || 'https://via.placeholder.com/300x200',
            disponibilite: service.disponibilite !== undefined ? service.disponibilite : true,
            condition: service.condition || ''
          };
        });
        
        console.log('Mapped services:', mappedServices);

        setServices(mappedServices);
        setFilteredServices(mappedServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  useEffect(() => {
    // Filter and sort services whenever dependencies change
    let results = [...services];
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== "All Categories") {
      results = results.filter(service => service.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      results = results.filter(
        service => 
          service.title.toLowerCase().includes(lowerSearch) || 
          service.description.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Default sorting (no specific order)
        break;
    }
    
    setFilteredServices(results);
    
    // Update URL search params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory && selectedCategory !== "All Categories") params.set('category', selectedCategory);
    setSearchParams(params);
    
  }, [services, searchTerm, selectedCategory, sortBy, setSearchParams]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The actual filtering happens in the useEffect
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  return (
    <main className="flex-grow bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
            <p className="text-gray-600 mt-1">Find the perfect service for your needs</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input 
                  type="text"
                  placeholder="Search services..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredServices.map(service => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No services found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('default');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default ServicesPage;
