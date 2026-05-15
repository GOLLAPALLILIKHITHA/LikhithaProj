import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSection {
  title: string;
  isOpen: boolean;
}

export default function PropertyFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sections, setSections] = useState<Record<string, boolean>>({
    bhkType: true,
    priceRange: true,
    propertyStatus: true,
    furnishing: true,
    propertyType: true,
    amenities: false,
    location: false
  });

  const bhkTypes = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];
  const propertyStatuses = ['Under Construction', 'Ready'];
  const furnishingTypes = ['Full', 'Semi', 'None'];
  const propertyTypes = ['Apartment', 'Independent House/Villa', 'Builder Floor', 'Studio Apartment'];

  const selectedBHK = searchParams.get('bhk')?.split(',') || [];
  const selectedStatus = searchParams.get('status') || '';
  const selectedFurnishing = searchParams.get('furnishing') || '';
  const selectedPropertyType = searchParams.get('propertyType') || '';
  const newBuilderProjects = searchParams.get('newBuilder') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const updateParam = (key: string, value: string | string[]) => {
    const params = new URLSearchParams(searchParams);
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','));
      } else {
        params.delete(key);
      }
    } else {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete('page'); // Reset to first page when filters change
    setSearchParams(params);
  };

  const handleBHKToggle = (bhk: string) => {
    const newSelection = selectedBHK.includes(bhk)
      ? selectedBHK.filter(b => b !== bhk)
      : [...selectedBHK, bhk];
    updateParam('bhk', newSelection);
  };

  const resetFilters = () => {
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (search) params.set('search', search);
    setSearchParams(params);
  };

  const toggleSection = (section: string) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const FilterSection = ({ title, children, sectionKey }: { title: string; children: React.ReactNode; sectionKey: string }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-800 hover:text-gray-600"
      >
        <span>{title}</span>
        {sections[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {sections[sectionKey] && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">Filters</h3>
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">1</span>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* BHK Type */}
      <FilterSection title="BHK Type" sectionKey="bhkType">
        <div className="grid grid-cols-3 gap-2">
          {bhkTypes.map(bhk => (
            <button
              key={bhk}
              onClick={() => handleBHKToggle(bhk)}
              className={`p-2 text-sm border rounded-md transition-colors ${
                selectedBHK.includes(bhk)
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
              }`}
            >
              {bhk}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* New Builder Projects */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={newBuilderProjects}
            onChange={(e) => updateParam('newBuilder', e.target.checked ? 'true' : '')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">New Builder Projects</span>
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">New</span>
        </label>
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range: ₹ 0 to ₹ 10 Cr" sectionKey="priceRange">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => updateParam('minPrice', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => updateParam('maxPrice', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Price Range Slider Placeholder */}
          <div className="relative">
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹0</span>
              <span>₹10 Cr</span>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Property Status */}
      <FilterSection title="Property Status" sectionKey="propertyStatus">
        <div className="space-y-2">
          {propertyStatuses.map(status => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyStatus"
                value={status}
                checked={selectedStatus === status}
                onChange={(e) => updateParam('status', e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{status}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Furnishing */}
      <FilterSection title="Furnishing" sectionKey="furnishing">
        <div className="space-y-2">
          {furnishingTypes.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFurnishing === type}
                onChange={(e) => updateParam('furnishing', e.target.checked ? type : '')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Property Type */}
      <FilterSection title="Property Type" sectionKey="propertyType">
        <div className="space-y-2">
          {propertyTypes.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPropertyType === type}
                onChange={(e) => updateParam('propertyType', e.target.checked ? type : '')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Premium Filters Badge */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-purple-700">Premium Filters</span>
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">New</span>
        </div>
        <p className="text-xs text-gray-600">Get access to advanced filters and save your searches</p>
        <button className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded-md transition-colors">
          Upgrade Now
        </button>
      </div>
    </div>
  );
}