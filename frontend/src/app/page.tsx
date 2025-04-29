
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-brand-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 space-y-5 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Find the perfect service for your needs
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                Connect with skilled professionals ready to deliver quality services. From home repairs to digital solutions, find it all on ServiceSpot.
              </p>
              <div className="flex flex-wrap gap-4 pt-3">
                <Link to="/services">
                  <Button className="bg-brand-600 hover:bg-brand-500">
                    Browse Services
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-brand-900">
                    Become a Provider
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Service Marketplace" 
                className="max-w-xs sm:max-w-sm md:max-w-md rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">How ServiceSpot Works</h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Simple steps to get the service you need or start offering your skills
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-brand-600 text-white text-xl font-bold">
                  1
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Browse Services</h3>
                <p className="mt-2 text-gray-600">
                  Search through our marketplace to find the service that matches your needs.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-brand-600 text-white text-xl font-bold">
                  2
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Connect</h3>
                <p className="mt-2 text-gray-600">
                  Get in touch with service providers and discuss your requirements.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-brand-600 text-white text-xl font-bold">
                  3
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Get it Done</h3>
                <p className="mt-2 text-gray-600">
                  Hire professionals and get your tasks completed with quality and efficiency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">Popular Categories</h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Explore some of our most requested service categories
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {["Home Repair", "Web Design", "Cleaning", "Teaching", "Marketing", "Photography"].map((category) => (
                <Link 
                  key={category} 
                  to={`/services?category=${category}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-all hover:border-brand-500"
                >
                  <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                  <p className="mt-1 text-sm text-gray-500">View services</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold">ServiceSpot</h3>
              <p className="mt-2 text-gray-400">Find the perfect service for any task</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About</h4>
                <div className="mt-4 space-y-2">
                  <Link to="#" className="text-base text-gray-300 hover:text-white block">How it works</Link>
                  <Link to="#" className="text-base text-gray-300 hover:text-white block">Testimonials</Link>
                  <Link to="#" className="text-base text-gray-300 hover:text-white block">Careers</Link>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h4>
                <div className="mt-4 space-y-2">
                  <Link to="#" className="text-base text-gray-300 hover:text-white block">Help Center</Link>
                  <Link to="#" className="text-base text-gray-300 hover:text-white block">Terms of Service</Link>
                  <Link to="#" className="text-base text-gray-300 hover:text-white block">Privacy</Link>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact</h4>
                <div className="mt-4 space-y-2">
                  <Link to="#" className="text-base text-gray-300 hover:text-white block">contact@servicespot.com</Link>
                  <Link to="#" className="text-base text-gray-300 hover:text-white block">+1 (555) 123-4567</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">&copy; 2025 ServiceSpot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
