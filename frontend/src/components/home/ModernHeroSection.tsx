import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, Home, Building, Package, Wrench, Sparkles } from 'lucide-react';
import CategorySearchInterface from './CategorySearchInterface';

const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];

export default function ModernHeroSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Bangalore');
  const navigate = useNavigate();

  const categories = [
    { 
      id: 'property_buy', 
      label: 'Buy Property', 
      icon: Home, 
      color: 'from-emerald-400 to-teal-500',
      hoverColor: 'hover:from-emerald-500 hover:to-teal-600',
      description: 'Find your dream home'
    },
    { 
      id: 'property_rent', 
      label: 'Rent Property', 
      icon: Building, 
      color: 'from-blue-400 to-indigo-500',
      hoverColor: 'hover:from-blue-500 hover:to-indigo-600',
      description: 'Comfortable living spaces'
    },
    { 
      id: 'furniture', 
      label: 'Furniture', 
      icon: Package, 
      color: 'from-purple-400 to-pink-500',
      hoverColor: 'hover:from-purple-500 hover:to-pink-600',
      description: 'Beautiful home furniture'
    },
    { 
      id: 'materials', 
      label: 'Materials', 
      icon: Package, 
      color: 'from-orange-400 to-red-500',
      hoverColor: 'hover:from-orange-500 hover:to-red-600',
      description: 'Quality building materials'
    },
    { 
      id: 'services', 
      label: 'Services', 
      icon: Wrench, 
      color: 'from-cyan-400 to-blue-500',
      hoverColor: 'hover:from-cyan-500 hover:to-blue-600',
      description: 'Professional home services'
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (['property_buy', 'property_rent', 'furniture', 'materials', 'services'].includes(categoryId)) {
      setActiveCategory(categoryId);
    } else {
      navigate(`/listings?category=${categoryId}`);
    }
  };

  const handleQuickSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 shadow-lg mb-8">
            <Sparkles className="text-yellow-500" size={20} />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🇮🇳 INDIA'S FASTEST GROWING MARKETPLACE
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Your Perfect
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Home Awaits
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover amazing properties, furniture, materials & services in{' '}
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {city}
            </span>
          </p>

          {/* Quick Search Bar */}
          {!activeCategory && (
            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-2">
                <div className="flex gap-2">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent border-none outline-none px-4 py-4 text-slate-700 font-medium min-w-[140px] cursor-pointer"
                  >
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search properties, furniture, services..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                      className="w-full bg-transparent border-none outline-none pl-12 pr-4 py-4 text-slate-700 placeholder-slate-400"
                    />
                  </div>
                  
                  <button
                    onClick={handleQuickSearch}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Cards */}
        {!activeCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">
                      {category.label}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Category Search Interface */}
        {activeCategory && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <button
                onClick={() => setActiveCategory(null)}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                ← Back to Categories
              </button>
            </div>
            
            <CategorySearchInterface 
              category={activeCategory as 'property_buy' | 'property_rent' | 'furniture' | 'materials' | 'services'} 
            />
          </div>
        )}

        {/* Popular Locations */}
        {!activeCategory && (
          <div className="text-center">
            <p className="text-slate-600 mb-6 text-lg">Popular in {city}:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City', 'Marathahalli'].map(area => (
                <button
                  key={area}
                  onClick={() => setSearch(area)}
                  className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-slate-700 hover:text-slate-900"
                >
                  <MapPin size={16} />
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}