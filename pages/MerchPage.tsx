import React, { useState, useEffect } from 'react';
import { getCatalogProducts } from '../services/printfulService';
import useSEO from '../hooks/useSEO';
import Spinner from '../components/Spinner';

interface Product {
  id: number;
  name: string;
  description?: string;
  image?: string;
  main_category_id?: number;
  type?: string;
  brand?: string;
  model?: string;
  files?: any[];
}

const MerchPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: 'Merch Store - BookBriefs',
    description: 'Browse our exclusive collection of BookBriefs merchandise.',
    keywords: 'bookbriefs, merchandise, merch, shop',
    type: 'website',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getCatalogProducts(20, 0);
        console.log('Printful products:', data);
        setProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please check your API configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Troubleshooting:</p>
            <ul className="text-left space-y-1">
              <li>• Check that the Printful API key is set in Netlify environment variables</li>
              <li>• Verify the serverless function is deployed</li>
              <li>• Try refreshing the page</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">BookBriefs Merch</h1>
        <p className="text-xl text-gray-600">
          Exclusive merchandise for book lovers
        </p>
      </div>

      {/* Coming Soon Notice */}
      <div className="max-w-2xl mx-auto mb-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">🎨 Store Coming Soon!</h2>
        <p className="text-center text-gray-700">
          We're currently setting up our merch store with awesome products for book enthusiasts.
          This page shows the Printful catalog products available. Stay tuned for our custom designs!
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="mb-8">
            <p className="text-center text-gray-600">
              {products.length} products available in the Printful catalog
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      <svg
                        className="w-16 h-16 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm">No image</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.type && (
                    <p className="text-sm text-gray-500 mb-2">
                      Type: {product.type}
                    </p>
                  )}
                  {product.brand && (
                    <p className="text-sm text-gray-500 mb-2">
                      Brand: {product.brand}
                    </p>
                  )}
                  <button
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                    onClick={() => alert('Product details coming soon!')}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found.</p>
          <p className="text-gray-500 text-sm mt-2">
            Check your Printful API configuration
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">About Our Merch</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Our merchandise is powered by Printful, ensuring high-quality products
              and reliable shipping worldwide.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🌍</div>
                <h3 className="font-semibold mb-2">Worldwide Shipping</h3>
                <p className="text-sm text-gray-600">We ship to most countries</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-semibold mb-2">Premium Quality</h3>
                <p className="text-sm text-gray-600">High-quality materials</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="font-semibold mb-2">Unique Designs</h3>
                <p className="text-sm text-gray-600">Exclusive BookBriefs artwork</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchPage;
