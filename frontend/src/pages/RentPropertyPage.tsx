import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building, ArrowLeft } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad'];

export default function RentPropertyPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [propertySubType, setPropertySubType] = useState('Full House');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('category', 'property_rent');
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (propertySubType) params.set('propertyType', propertySubType);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Rent Property Search</h1>
          <p className="text-gray-600 mt-2">Find comfortable living spaces for rent</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Building size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Rent Properties</h2>
                <p className="text-white/90 text-lg">Comfortable living spaces</p>
              </div>
            </div>
            
            <div className="flex gap-6 mb-6">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">✓ Packers And Movers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">✓ Lowest Prices</span>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="p-8">
            {/* Main Search Bar */}
            <div className="mb-8">
              <div className="flex gap-4 mb-6">
                <div className="w-48">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-800 font-medium"
                  >
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search Location</label>
                  <input
                    type="text"
                    placeholder="Search upto 3 localities or landmarks"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="pt-7">
                  <button
                    onClick={handleSearch}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105 shadow-lg"
                  >
                    <Search size={20} />
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Type</h3>
              <div className="flex gap-6">
                {['Full House', 'PG/Hostel', 'Flatmates'].map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="propertyType"
                      value={type}
                      checked={propertySubType === type}
                      onChange={(e) => setPropertySubType(e.target.value)}
                      className="w-5 h-5 text-blue-500"
                    />
                    <span className="text-gray-700 font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center justify-end pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Are you a Property Owner?</p>
                <button 
                  onClick={() => navigate('/post-ad')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Post Free Property Ad
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}