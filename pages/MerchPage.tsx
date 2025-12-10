import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, Truck, Shield, Star, Filter, X } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { getStoreProducts, getStoreProductById, PrintfulProduct, PrintfulProductDetails } from '../services/printfulService';
import Spinner from '../components/Spinner';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';

const MerchPage: React.FC = () => {
  const [products, setProducts] = useState<PrintfulProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<PrintfulProductDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useSEO({
    title: 'Merch Store | BookBriefs',
    description: 'Shop official BookBriefs merchandise. T-shirts, hoodies, mugs, and more featuring unique designs for book lovers and traders.',
    keywords: 'bookbriefs merch, merchandise, t-shirts, hoodies, book lover gifts, trading merchandise',
    type: 'website',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getStoreProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = async (productId: number) => {
    try {
      setLoadingProduct(true);
      const productDetails = await getStoreProductById(productId);
      setSelectedProduct(productDetails);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoadingProduct(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Extract categories from product names (e.g., "T-Shirt", "Hoodie", "Mug")
  const categories = ['all', ...Array.from(new Set(products.map(p => {
    const name = p.name.toLowerCase();
    if (name.includes('t-shirt') || name.includes('tee')) return 'T-Shirts';
    if (name.includes('hoodie') || name.includes('sweatshirt')) return 'Hoodies';
    if (name.includes('mug') || name.includes('cup')) return 'Mugs';
    if (name.includes('poster') || name.includes('print')) return 'Posters';
    if (name.includes('hat') || name.includes('cap')) return 'Hats';
    if (name.includes('bag') || name.includes('tote')) return 'Bags';
    return 'Other';
  })))];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => {
        const name = p.name.toLowerCase();
        const category = selectedCategory.toLowerCase();
        if (category === 't-shirts') return name.includes('t-shirt') || name.includes('tee');
        if (category === 'hoodies') return name.includes('hoodie') || name.includes('sweatshirt');
        if (category === 'mugs') return name.includes('mug') || name.includes('cup');
        if (category === 'posters') return name.includes('poster') || name.includes('print');
        if (category === 'hats') return name.includes('hat') || name.includes('cap');
        if (category === 'bags') return name.includes('bag') || name.includes('tote');
        return true;
      });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading merchandise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium">Official Merch Store</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Wear Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Passion</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Premium quality merchandise for book lovers and traders. Every purchase supports our mission to spread knowledge.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Truck className="w-5 h-5" />
                <span className="text-sm">Worldwide Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Package className="w-5 h-5" />
                <span className="text-sm">Print-on-Demand</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Star className="w-5 h-5" />
                <span className="text-sm">Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon!</h3>
            <p className="text-gray-600">We're preparing amazing merchandise for you. Stay tuned!</p>
          </div>
        ) : (
          <>
            {/* Category Filter */}
            {categories.length > 2 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Filter by Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {category === 'all' ? 'All Products' : category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-4">
                <Package className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">All products are printed on high-quality materials for durability and comfort.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
                <Truck className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Products are printed and shipped directly to you from the nearest facility.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfaction Guaranteed</h3>
              <p className="text-gray-600">Not happy with your order? We'll make it right with our hassle-free returns.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {isModalOpen && selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={closeModal}
        />
      )}

      {/* Loading overlay for product details */}
      {loadingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <Spinner />
            <p className="mt-2 text-gray-600">Loading product details...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchPage;
