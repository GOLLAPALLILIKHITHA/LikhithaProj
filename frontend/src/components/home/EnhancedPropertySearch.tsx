import { useState } from 'react';
import BuyPropertySearch from './BuyPropertySearch';
import RentPropertySearch from './RentPropertySearch';
import CommercialPropertySearch from './CommercialPropertySearch';

export default function EnhancedPropertySearch() {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'commercial'>('buy');

  const tabs = [
    { key: 'buy' as const, label: 'Buy', color: 'border-red-500 text-red-600' },
    { key: 'rent' as const, label: 'Rent', color: 'border-blue-500 text-blue-600' },
    { key: 'commercial' as const, label: 'Commercial', color: 'border-purple-500 text-purple-600' }
  ];

  const renderSearchComponent = () => {
    switch (activeTab) {
      case 'buy':
        return <BuyPropertySearch />;
      case 'rent':
        return <RentPropertySearch />;
      case 'commercial':
        return <CommercialPropertySearch />;
      default:
        return <BuyPropertySearch />;
    }
  };

  return (
    <div className="py-8 px-4">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-8 py-3 rounded-md font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? `bg-white shadow-md ${tab.color} border-b-2`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Component */}
      <div className="transition-all duration-300">
        {renderSearchComponent()}
      </div>
    </div>
  );
}