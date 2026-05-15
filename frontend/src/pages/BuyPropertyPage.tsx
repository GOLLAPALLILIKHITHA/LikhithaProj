import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad'];
const bhkTypes = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];

export default function BuyPropertyPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [selectedBHK, setSelectedBHK] = useState<string[]>([]);
  const [propertySubType, setPropertySubType] = useState('Full House');
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
    if (propertySubType) params.set('propertyType', propertySubType);
    if (newBuilderProjects) params.set('newBuilder', 'true');
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Property Search</h1>
          <p className="text-gray-600 mt-2">Find your perfect property with advanced search options</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Home size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Buy Properties</h2>
                <p className="text-white/90 text-lg">Find your dream home</p>
              </div>
            </div>
            
            <div className="flex gap-6 mb-6">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">✓ Verified Properties</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">✓ Zero Brokerage</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">✓ 45-Days Guarantee</span>
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
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800 font-medium"
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
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
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
              <div className="flex gap-4">
                {['Full House', 'Land/Plot'].map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="propertyType"
                      value={type}
                      checked={propertySubType === type}
                      onChange={(e) => setPropertySubType(e.target.value)}
                      className="w-5 h-5 text-orange-500"
                    />
                    <span className="text-gray-700 font-medium">{type}</span>
                  </label>
                ))}
                <div className="ml-auto">
                  <span className="text-gray-600 font-medium">BHK Type:</span>
                </div>
              </div>
            </div>

            {/* BHK Selection */}
            <div className="mb-8">
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-100">
                <div className="grid grid-cols-6 gap-4">
                  {bhkTypes.map(bhk => (
                    <label key={bhk} className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedBHK.includes(bhk)}
                        onChange={() => handleBHKToggle(bhk)}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="font-medium text-gray-700">{bhk}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBuilderProjects}
                    onChange={(e) => setNewBuilderProjects(e.target.checked)}
                    className="w-5 h-5 text-orange-500"
                  />
                  <span className="font-medium text-gray-700">New Builder Projects</span>
                </label>
              </div>
              
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

        {/* Why Choose Our Platform */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl">🏠</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">No Brokerage</h3>
              <p className="text-gray-600">Direct contact with property owners. Save on brokerage fees.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Verified Properties</h3>
              <p className="text-gray-600">All properties are verified for authenticity and accuracy.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Get assistance anytime with our dedicated support team.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}