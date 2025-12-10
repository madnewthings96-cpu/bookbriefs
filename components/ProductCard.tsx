import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { PrintfulProduct } from '../services/printfulService';

interface ProductCardProps {
  product: PrintfulProduct;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="aspect-square overflow-hidden relative bg-gray-50">
        <img
          src={product.thumbnail_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <button 
              className="p-3 bg-white rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-colors"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Badge for variants */}
        {product.variants > 1 && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
              {product.variants} variants
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-500">
            Click to view details
          </span>
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
