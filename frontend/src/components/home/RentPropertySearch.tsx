import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Home } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon'];

export default function RentPropertySearch() {
  const [city, setCity] = useState('Bangalore');
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('Full House');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('category', 'property_rent');
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (propertyType) params.set('propertyType', propertyType);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">
          World's Largest NoBrokerage Property Site
        </h2>
        <div className="flex justify-center gap-6 mb-4">
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
            <Users size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Packers And Movers</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
            <span className="text-sm font-medium text-green-700">Lowest Prices</span>
          </div>
        </div>
      </div>

      {/* Main Search Section */}
      <div className="space-y-4">
        {/* City and Search Bar */}
        <div className="flex gap-3">
          <div className="w-48">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search upto 3 localities or landmarks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Search size={18} />
            Search
          </button>
        </div>

        {/* Property Type Selection */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value="Full House"
                checked={propertyType === 'Full House'}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Full House</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value="PG/Hostel"
                checked={propertyType === 'PG/Hostel'}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">PG/Hostel</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value="Flatmates"
                checked={propertyType === 'Flatmates'}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Flatmates</span>
            </label>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-gray-600 font-medium">BHK Type:</span>
          </div>
        </div>

        {/* Additional Options */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            {/* Empty space for consistency */}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Are you a Property Owner?</p>
            <button 
              onClick={() => navigate('/post-ad')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Post Free Property Ad
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Info Banner */}
      <div className="mt-6 bg-slate-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 text-sm">
        <span>Do you know how much</span>
        <span className="font-bold text-orange-400">loan</span>
        <span>you can get? Get maximum with</span>
        <span className="font-bold text-orange-400">NoBroker</span>
        <button className="ml-4 bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded text-sm font-medium transition-colors">
          Check Eligibility
        </button>
      </div>
    </div>
  );
}