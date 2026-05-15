import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Building2 } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon'];
const bhkTypes = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];

export default function BuyPropertySearch() {
  const [city, setCity] = useState('Bangalore');
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('Full House');
  const [selectedBHK, setSelectedBHK] = useState<string[]>([]);
  const [newBuilderProjects, setNewBuilderProjects] = useState(false);
  const navigate = useNavigate();

  const handleBHKToggle = (bhk: string) => {
    setSelectedBHK(prev => 
      prev.includes(bhk) 
        ? prev.filter(b => b !== bhk)
        : [...prev, bhk]
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('category', 'property_sell');
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (selectedBHK.length > 0) params.set('bhk', selectedBHK.join(','));
    if (propertyType) params.set('propertyType', propertyType);
    if (newBuilderProjects) params.set('newBuilder', 'true');
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
            <Home size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Home Interiors</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
            <span className="text-sm font-medium text-blue-700">45-Days Guarantee</span>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value="Full House"
                checked={propertyType === 'Full House'}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <span className="text-gray-700 font-medium">Full House</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value="Land/Plot"
                checked={propertyType === 'Land/Plot'}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <span className="text-gray-700 font-medium">Land/Plot</span>
            </label>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-gray-600 font-medium">BHK Type:</span>
          </div>
        </div>

        {/* BHK Selection */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-6 gap-3">
            {bhkTypes.map(bhk => (
              <label key={bhk} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={selectedBHK.includes(bhk)}
                  onChange={() => handleBHKToggle(bhk)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">{bhk}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newBuilderProjects}
                onChange={(e) => setNewBuilderProjects(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">New Builder Projects</span>
            </label>
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