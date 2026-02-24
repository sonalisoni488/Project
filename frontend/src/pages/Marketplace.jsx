import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/ListingCard';

// Dummy data for marketplace
const dummyListings = [
  {
    id: 1,
    wasteType: 'Plastic Bottles',
    description: 'Clean plastic bottles available for recycling. Perfect for manufacturing new plastic products.',
    weight: '500 kg',
    price: '$150',
    location: 'New York, NY',
    status: 'Available',
    image: 'https://via.placeholder.com/400x300?text=Plastic+Bottles',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    wasteType: 'Cardboard Boxes',
    description: 'High-quality cardboard boxes in good condition. Suitable for packaging and storage.',
    weight: '200 kg',
    price: '$80',
    location: 'Los Angeles, CA',
    status: 'Available',
    image: 'https://via.placeholder.com/400x300?text=Cardboard+Boxes',
    createdAt: '2024-01-14'
  },
  {
    id: 3,
    wasteType: 'Metal Scrap',
    description: 'Mixed metal scrap including aluminum, steel, and copper. Great for recycling.',
    weight: '750 kg',
    price: '$450',
    location: 'Chicago, IL',
    status: 'Available',
    image: 'https://via.placeholder.com/400x300?text=Metal+Scrap',
    createdAt: '2024-01-13'
  },
  {
    id: 4,
    wasteType: 'Glass Bottles',
    description: 'Clean glass bottles in various sizes. Perfect for glass recycling projects.',
    weight: '300 kg',
    price: '$120',
    location: 'Houston, TX',
    status: 'Available',
    image: 'https://via.placeholder.com/400x300?text=Glass+Bottles',
    createdAt: '2024-01-12'
  },
  {
    id: 5,
    wasteType: 'Wood Pallets',
    description: 'Used wooden pallets in good condition. Can be refurbished or used for projects.',
    weight: '100 kg',
    price: '$60',
    location: 'Phoenix, AZ',
    status: 'Available',
    image: 'https://via.placeholder.com/400x300?text=Wood+Pallets',
    createdAt: '2024-01-11'
  },
  {
    id: 6,
    wasteType: 'Electronic Waste',
    description: 'Old electronics and computer parts. Contains valuable metals for recycling.',
    weight: '150 kg',
    price: '$300',
    location: 'Philadelphia, PA',
    status: 'Available',
    image: 'https://via.placeholder.com/400x300?text=Electronic+Waste',
    createdAt: '2024-01-10'
  },
  {
    id: 7,
    wasteType: 'Paper Waste',
    description: 'Mixed paper and newspaper waste. Good for paper recycling.',
    weight: '400 kg',
    price: '$100',
    location: 'San Antonio, TX',
    status: 'Available',
    image: 'https://via.placeholder.com/400x300?text=Paper+Waste',
    createdAt: '2024-01-09'
  },
  {
    id: 8,
    wasteType: 'Textile Waste',
    description: 'Used clothing and fabric scraps. Suitable for textile recycling.',
    weight: '250 kg',
    price: '$90',
    location: 'San Diego, CA',
    status: 'Available',
    image: 'https://via.placeholder.com/400x300?text=Textile+Waste',
    createdAt: '2024-01-08'
  }
];

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'plastic', label: 'Plastic' },
    { value: 'paper', label: 'Paper' },
    { value: 'metal', label: 'Metal' },
    { value: 'glass', label: 'Glass' },
    { value: 'wood', label: 'Wood' },
    { value: 'textile', label: 'Textile' },
    { value: 'electronic', label: 'Electronic' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'weight-high', label: 'Weight: High to Low' }
  ];

  // Filter and sort listings
  const filteredListings = dummyListings
    .filter(listing => {
      const matchesSearch = listing.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           listing.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                            listing.wasteType.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', ''));
        case 'price-high':
          return parseInt(b.price.replace('$', '')) - parseInt(a.price.replace('$', ''));
        case 'weight-high':
          return parseInt(b.weight.replace('kg', '')) - parseInt(a.weight.replace('kg', ''));
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Waste Marketplace
            </h1>
            <p className="text-xl text-green-100">
              Find and trade waste materials for a sustainable future
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for waste materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredListings.length} of {dummyListings.length} listings
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No listings found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
