import React, { useState, useEffect } from 'react';
import { getStoreProducts, getStoreProductById, PrintfulProduct, PrintfulProductDetails } from '../services/printfulService';
import useSEO from '../hooks/useSEO';
import Spinner from '../components/Spinner';
import PayPalButton from '../components/PayPalButton';

const MerchPage: React.FC = () => {
  const [products, setProducts] = useState<PrintfulProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PrintfulProductDetails | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address1: '',
    city: '',
    state_code: '',
    country_code: 'US',
    zip: '',
  });

  useSEO({
    title: 'Merch Store - BookBriefs',
    description: 'Browse our exclusive collection of BookBriefs merchandise.',
    keywords: 'bookbriefs, merchandise, merch, shop',
    type: 'website',
  });

  // Detect user's country from IP address
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Using ipapi.co free service (no API key required)
        console.log('Fetching country from IP...');
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          console.log('IP API response:', data);
          if (data.country_code) {
            setShippingInfo(prev => ({
              ...prev,
              country_code: data.country_code,
            }));
            console.log('✅ Country set to:', data.country_code, data.country_name);
          }
        } else {
          console.log('IP API response not OK:', response.status);
        }
      } catch (error) {
        console.log('Could not detect country, using default (US)', error);
      }
    };

    detectCountry();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getStoreProducts();
        console.log('Printful store products:', data);
        setProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products. Please check your API configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleViewDetails = async (productId: number | string) => {
    try {
      setLoadingDetails(true);
      const details = await getStoreProductById(productId);
      setSelectedProduct(details);
    } catch (err) {
      console.error('Failed to load product details:', err);
      alert('Failed to load product details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBuyNow = (variant: any) => {
    setSelectedVariant(variant);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = async (paypalOrderId: string) => {
    try {
      // Create order in Printful
      const response = await fetch('/.netlify/functions/create-printful-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          recipient: shippingInfo,
          paypalOrderId: paypalOrderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      console.log('Printful order created:', data);

      alert('✅ Order placed successfully!\n\nYou will receive a confirmation email soon with tracking information.');
      setShowCheckout(false);
      setSelectedVariant(null);
      setShippingInfo({
        name: '',
        email: '',
        address1: '',
        city: '',
        state_code: '',
        country_code: 'US',
        zip: '',
      });
      closeModal();
    } catch (error) {
      console.error('Order creation error:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to process order'}\n\nPlease contact support if payment was deducted.`);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setShowCheckout(false);
    setSelectedVariant(null);
  };

  const isShippingComplete = () => {
    return (
      shippingInfo.name &&
      shippingInfo.email &&
      shippingInfo.address1 &&
      shippingInfo.city &&
      shippingInfo.state_code &&
      shippingInfo.country_code &&
      shippingInfo.zip
    );
  };

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
                  {product.thumbnail_url ? (
                    <img
                      src={product.thumbnail_url}
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
                  <p className="text-sm text-gray-500 mb-2">
                    {product.variants} variant{product.variants !== 1 ? 's' : ''} available
                  </p>
                  {product.synced > 0 && (
                    <p className="text-sm text-green-600 mb-2">
                      ✓ In stock
                    </p>
                  )}
                  <button
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                    onClick={() => handleViewDetails(product.id)}
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

      {/* Product Detail Modal */}
      {selectedProduct && !showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedProduct.sync_product.name}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingDetails ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Product Image */}
                  <div className="mb-6">
                    <img
                      src={selectedProduct.sync_product.thumbnail_url}
                      alt={selectedProduct.sync_product.name}
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                  </div>

                  {/* Variants */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Available Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProduct.sync_variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{variant.name}</h4>
                              {variant.product?.image && (
                                <img
                                  src={variant.product.image}
                                  alt={variant.name}
                                  className="w-24 h-24 object-cover rounded mt-2"
                                />
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                ${variant.retail_price}
                              </p>
                              <p className="text-xs text-gray-500">{variant.currency}</p>
                            </div>
                          </div>

                          {/* Files/Preview Images */}
                          {variant.files && variant.files.length > 0 && (
                            <div className="mb-3">
                              <div className="grid grid-cols-3 gap-2">
                                {variant.files.slice(0, 3).map((file, idx) => (
                                  <img
                                    key={idx}
                                    src={file.preview_url || file.thumbnail_url}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Buy Button */}
                          <button
                            onClick={() => handleBuyNow(variant)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                          >
                            Buy Now - ${variant.retail_price}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Product Information</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ High-quality print</li>
                      <li>✓ Fast shipping worldwide</li>
                      <li>✓ Secure payment with PayPal</li>
                      <li>✓ 100% satisfaction guarantee</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Checkout Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="flex justify-between items-center">
                  <span>{selectedVariant.name}</span>
                  <span className="font-bold text-xl">${selectedVariant.retail_price}</span>
                </div>
              </div>

              {/* Shipping Form */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address *</label>
                    <input
                      type="text"
                      value={shippingInfo.address1}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address1: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City *</label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State *</label>
                      <input
                        type="text"
                        value={shippingInfo.state_code}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state_code: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="NY"
                        maxLength={2}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                      <input
                        type="text"
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Country *</label>
                      <select
                        value={shippingInfo.country_code}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, country_code: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="ES">Spain</option>
                        <option value="IT">Italy</option>
                        <option value="NL">Netherlands</option>
                        <option value="SE">Sweden</option>
                        <option value="NO">Norway</option>
                        <option value="DK">Denmark</option>
                        <option value="FI">Finland</option>
                        <option value="IE">Ireland</option>
                        <option value="NZ">New Zealand</option>
                        {/* Arabic & Middle Eastern Countries */}
                        <option value="AE">United Arab Emirates</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="QA">Qatar</option>
                        <option value="KW">Kuwait</option>
                        <option value="BH">Bahrain</option>
                        <option value="OM">Oman</option>
                        <option value="JO">Jordan</option>
                        <option value="LB">Lebanon</option>
                        <option value="EG">Egypt</option>
                        <option value="MA">Morocco</option>
                        <option value="TN">Tunisia</option>
                        <option value="DZ">Algeria</option>
                        <option value="IQ">Iraq</option>
                        <option value="SY">Syria</option>
                        <option value="YE">Yemen</option>
                        <option value="LY">Libya</option>
                        <option value="SD">Sudan</option>
                        <option value="PS">Palestine</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* PayPal Payment */}
              <div className="mb-4">
                <h3 className="font-semibold mb-4">Payment Method</h3>
                {isShippingComplete() ? (
                  <div className="border rounded-lg p-4">
                    <PayPalButton
                      amount={selectedVariant.retail_price}
                      productName={selectedVariant.name}
                      variantId={selectedVariant.id}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800">
                      ⚠️ Please complete all shipping information to proceed with payment
                    </p>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="text-xs text-gray-500 text-center mt-4">
                <p>🔒 Secure checkout powered by PayPal</p>
                <p>Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>
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
                <div className="text-3xl mb-2">💳</div>
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-600">PayPal protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchPage;
