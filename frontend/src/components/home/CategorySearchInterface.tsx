import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, Tag, Package, Wrench, Home, Building } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];

interface CategorySearchProps {
  category: 'property_buy' | 'property_rent' | 'furniture' | 'materials' | 'services';
}

export default function CategorySearchInterface({ category }: CategorySearchProps) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const navigate = useNavigate();

  const categoryConfig = {
    property_buy: {
      title: 'Buy Properties',
      subtitle: 'Find your dream home',
      icon: Home,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      filters: ['1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Villa', 'Plot', 'Apartment', 'Independent House'],
      priceLabel: 'Budget Range'
    },
    property_rent: {
      title: 'Rent Properties',
      subtitle: 'Comfortable living spaces',
      icon: Building,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      filters: ['1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'PG/Hostel', 'Flatmates', 'Furnished', 'Unfurnished'],
      priceLabel: 'Monthly Rent'
    },
    furniture: {
      title: 'Home Furniture',
      subtitle: 'Beautiful furniture for every room',
      icon: Package,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      filters: ['Sofa Sets', 'Dining Tables', 'Beds', 'Wardrobes', 'Chairs', 'Tables', 'Storage', 'Decor'],
      priceLabel: 'Price Range'
    },
    materials: {
      title: 'Building Materials',
      subtitle: 'Quality construction materials',
      icon: Package,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      filters: ['Cement', 'Steel', 'Bricks', 'Tiles', 'Paint', 'Plumbing', 'Electrical', 'Hardware'],
      priceLabel: 'Budget'
    },
    services: {
      title: 'Home Services',
      subtitle: 'Professional home services',
      icon: Wrench,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      filters: ['Plumbing', 'Electrical', 'Painting', 'Cleaning', 'Pest Control', 'AC Repair', 'Carpentry', 'Interior Design'],
      priceLabel: 'Service Cost'
    }
  };

  const config = categoryConfig[category];
  const Icon = config.icon;

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('category', category);
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (selectedFilters.length > 0) params.set('filters', selectedFilters.join(','));
    if (priceRange.min) params.set('minPrice', priceRange.min);
    if (priceRange.max) params.set('maxPrice', priceRange.max);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header with Gradient */}
      <div className={`bg-gradient-to-r ${config.color} p-6 text-white`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Icon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{config.title}</h2>
            <p className="text-white/90 text-sm">{config.subtitle}</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex gap-3 mb-4">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[140px]"
            >
              {cities.map(c => (
                <option key={c} value={c} className="text-gray-800">{c}</option>
              ))}
            </select>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
              <input
                type="text"
                placeholder={`Search ${config.title.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-white/20 border border-white/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            
            <button
              onClick={handleSearch}
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className={config.textColor} />
            <h3 className="font-semibold text-gray-800">Filter Options</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {config.filters.map(filter => (
              <button
                key={filter}
                onClick={() => handleFilterToggle(filter)}
                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  selectedFilters.includes(filter)
                    ? `${config.bgColor} border-current ${config.textColor}`
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={18} className={config.textColor} />
            <h3 className="font-semibold text-gray-800">{config.priceLabel}</h3>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center text-gray-500 font-medium">to</div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSearch}
            className={`flex-1 bg-gradient-to-r ${config.color} text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all`}
          >
            Find {config.title}
          </button>
          <button
            onClick={() => navigate('/post-ad')}
            className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors"
          >
            Post Ad
          </button>
        </div>

        {/* Popular Searches */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">Popular in {city}:</p>
          <div className="flex flex-wrap gap-2">
            {['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City'].map(area => (
              <button
                key={area}
                onClick={() => setSearch(area)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <MapPin size={12} />
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}