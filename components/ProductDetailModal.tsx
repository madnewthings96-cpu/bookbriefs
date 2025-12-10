import React, { useState } from 'react';
import { X, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, ExternalLink, Check } from 'lucide-react';
import { PrintfulProductDetails, PrintfulVariant } from '../services/printfulService';

interface ProductDetailModalProps {
  product: PrintfulProductDetails;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const [selectedVariant, setSelectedVariant] = useState<PrintfulVariant | null>(
    product.sync_variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images from variants for the gallery
  const getAllImages = () => {
    const images: string[] = [];
    
    // Add main product thumbnail
    if (product.sync_product?.thumbnail_url) {
      images.push(product.sync_product.thumbnail_url);
    }

    // Add variant images
    product.sync_variants?.forEach(variant => {
      if (variant.files) {
        variant.files.forEach(file => {
          if (file.preview_url && !images.includes(file.preview_url)) {
            images.push(file.preview_url);
          }
        });
      }
      if (variant.product?.image && !images.includes(variant.product.image)) {
        images.push(variant.product.image);
      }
    });

    return images.length > 0 ? images : ['/placeholder-product.png'];
  };

  const images = getAllImages();

  // Extract size and color from variant name
  const getVariantOptions = () => {
    const sizes = new Set<string>();
    const colors = new Set<string>();

    product.sync_variants?.forEach(variant => {
      const parts = variant.name.split(' - ').pop()?.split(' / ') || [];
      if (parts.length >= 1) sizes.add(parts[0]);
      if (parts.length >= 2) colors.add(parts[1]);
    });

    return {
      sizes: Array.from(sizes),
      colors: Array.from(colors)
    };
  };

  const { sizes, colors } = getVariantOptions();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    // For now, redirect to Printful store or show a message
    // You can integrate with a cart system later
    alert(`Added ${quantity}x ${product.sync_product.name} to cart!\n\nNote: Cart functionality coming soon. For now, please contact us to place an order.`);
  };

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Gallery */}
            <div className="relative bg-gray-100 aspect-square md:aspect-auto md:h-full">
              <img
                src={images[currentImageIndex]}
                alt={product.sync_product?.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentImageIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6 md:p-8 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
              <div className="space-y-6">
                {/* Title & Price */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.sync_product?.name}
                  </h2>
                  {selectedVariant && (
                    <p className="text-3xl font-bold text-orange-600">
                      {selectedVariant.currency === 'USD' ? '$' : selectedVariant.currency}
                      {parseFloat(selectedVariant.retail_price).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => {
                        const isSelected = selectedVariant?.name.includes(size);
                        return (
                          <button
                            key={size}
                            onClick={() => {
                              const variant = product.sync_variants?.find(v => v.name.includes(size));
                              if (variant) setSelectedVariant(variant);
                            }}
                            className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const isSelected = selectedVariant?.name.includes(color);
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              const variant = product.sync_variants?.find(v => v.name.includes(color));
                              if (variant) setSelectedVariant(variant);
                            }}
                            className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Variant Dropdown (fallback if no size/color parsing) */}
                {sizes.length === 0 && colors.length === 0 && product.sync_variants && product.sync_variants.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Option
                    </label>
                    <select
                      value={selectedVariant?.id || ''}
                      onChange={(e) => {
                        const variant = product.sync_variants?.find(v => v.id === parseInt(e.target.value));
                        if (variant) setSelectedVariant(variant);
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors"
                    >
                      {product.sync_variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name} - ${parseFloat(variant.retail_price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>

                {/* Features */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    Premium quality print
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    Worldwide shipping
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    Easy returns & exchanges
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
