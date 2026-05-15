import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, Home, Building, Key } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad'];

const bhkTypes = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];

const propertyTypes = {
  buy: ['Full House', 'Land/Plot'],
  rent: ['Full House', 'PG/Hostel', 'Flatmates'],
  commercial: ['Rent', 'Buy']
};

export default function PropertySearchTabs() {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'commercial'>('buy');
  const [city, setCity] = useState('Bangalore');
  const [search, setSearch] = useState('');
  const [selectedBHK, setSelectedBHK] = useState<string[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState('Full House');
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
    params.set('category', activeTab === 'commercial' ? 'commercial' : 'property_' + activeTab);
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (selectedBHK.length > 0) params.set('bhk', selectedBHK.join(','));
    if (selectedPropertyType) params.set('propertyType', selectedPropertyType);
    if (newBuilderProjects) params.set('newBuilder', 'true');
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          World's Largest NoBrokerage Property Site
        </h2>
        <div className="flex justify-center gap-4 mb-4">
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
            <Home size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Home Interiors</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-green-700">45-Days Guarantee</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'buy' as const, label: 'Buy', color: 'text-red-600' },
            { key: 'rent' as const, label: 'Rent', color: 'text-blue-600' },
            { key: 'commercial' as const, label: 'Commercial', color: 'text-purple-600' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === tab.key
                  ? `bg-white shadow-sm ${tab.color} border-b-2 border-current`
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Form */}
      <div className="space-y-4">
        {/* City and Search */}
        <div className="flex gap-4">
          <div className="flex-1">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-2">
            <input
              type="text"
              placeholder="Search upto 3 localities or landmarks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
        <div className="flex items-center gap-4">
          {propertyTypes[activeTab].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value={type}
                checked={selectedPropertyType === type}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-gray-700">{type}</span>
            </label>
          ))}
          
          {activeTab !== 'commercial' && (
            <div className="ml-auto">
              <span className="text-gray-600 text-sm mr-2">BHK Type:</span>
            </div>
          )}
        </div>

        {/* BHK Selection for Buy/Rent */}
        {activeTab !== 'commercial' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-6 gap-2">
              {bhkTypes.map(bhk => (
                <label key={bhk} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBHK.includes(bhk)}
                    onChange={() => handleBHKToggle(bhk)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{bhk}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Additional Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {activeTab === 'buy' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBuilderProjects}
                  onChange={(e) => setNewBuilderProjects(e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">New Builder Projects</span>
              </label>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Are you a Property Owner?</p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Post Free Property Ad
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-6 bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center gap-2">
        <span className="text-sm">Do you know how much</span>
        <span className="font-bold text-orange-400">loan</span>
        <span className="text-sm">you can get? Get maximum with</span>
        <span className="font-bold text-orange-400">NoBroker</span>
        <button className="ml-4 bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded text-sm font-medium transition-colors">
          Check Eligibility
        </button>
      </div>
    </div>
  );
}