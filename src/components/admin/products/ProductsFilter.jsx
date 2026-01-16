'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function ProductsFilter({ products, onFilterChange }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;

        const query = searchQuery.toLowerCase();
        return products.filter(p =>
            p.sku.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    // ✅ EFECTO: notificar al padre
    useEffect(() => {
        onFilterChange(filteredProducts);
    }, [filteredProducts, onFilterChange]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por código SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="text-sm text-gray-600 whitespace-nowrap">
                    {searchQuery ? (
                        <span>
                            <span className="font-semibold">{filteredProducts.length}</span> de {products.length}
                        </span>
                    ) : (
                        <span className="font-semibold">{products.length}</span>
                    )}
                    {' '}producto{products.length !== 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
}
