import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ListingCard = ({ listing }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if listing is already favorited
    checkFavoriteStatus();
  }, [listing._id, user]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/favorites/check/${listing._id}`);
      setIsFavorited(response.data.isFavorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Please login to save listings');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        await api.delete(`/favorites/${listing._id}`);
        setIsFavorited(false);
      } else {
        // Add to favorites
        await api.post('/favorites', { listingId: listing._id });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to save listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
      {/* Image */}
      <div className="h-48 bg-gray-200 relative">
        <img
          src={listing.imageUrl || listing.image || 'https://via.placeholder.com/400x300?text=Waste+Material'}
          alt={listing.wasteType}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Image failed to load:', listing.imageUrl);
            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
          }}
        />
        
        {/* Heart Icon - Top Right Corner */}
        <button
          onClick={toggleFavorite}
          disabled={isLoading}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isFavorited 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white text-gray-400 hover:text-red-500 hover:bg-gray-100'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} shadow-md`}
          title={isFavorited ? 'Remove from saved' : 'Save to favorites'}
        >
          <Heart 
            className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} 
          />
        </button>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {listing.status || 'Available'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {listing.title || listing.wasteType}
            </h3>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              {listing.wasteType}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            {listing.weight}
          </div>
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${listing.price}
          </div>
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.location}
          </div>
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(listing.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/listing/${listing._id}`}
          className="w-full bg-green-600 text-white hover:bg-green-700 text-center py-2 px-4 rounded-md font-medium transition-colors duration-200 inline-block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ListingCard;
