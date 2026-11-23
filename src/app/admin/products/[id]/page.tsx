'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2,
  Sun,
  Zap,
  Battery,
  Settings,
  Circle,
  Info,
  List,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLocale, useTranslations } from 'next-intl';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchProduct() {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('solar_products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this product?')) return;
    
    try {
      const { error } = await supabase.from('solar_products').delete().eq('id', params.id);
      if (error) throw error;
      window.location.href = '/admin/products';
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  function formatPrice(price: number | null): string {
    if (price === null) return '-';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  }

  function getTypeBadgeClass(type: string): string {
    const colors: Record<string, string> = {
      package: 'bg-orange-50 text-orange-600',
      panel: 'bg-orange-50 text-orange-600',
      inverter: 'bg-orange-50 text-orange-600',
      battery: 'bg-orange-50 text-orange-600',
      mounting: 'bg-orange-50 text-orange-600',
      charger: 'bg-orange-50 text-orange-600',
      system: 'bg-orange-50 text-orange-600'
    };
    return colors[type] || 'bg-orange-50 text-orange-600';
  }

  function getTypeIcon(type: string) {
    const iconMap: Record<string, any> = {
      package: List,
      panel: Sun,
      inverter: Zap,
      battery: Battery,
      mounting: Settings,
      charger: Circle
    };
    return iconMap[type] || Info;
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#1a0e00]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="mt-4 text-orange-400/60">{t('loadingProduct')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl">
        <p className="text-red-400">{error}</p>
        <Link href="/admin/products">
          <button className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl">{t('backToProducts')}</button>
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 bg-orange-900/20 border border-orange-800/50 rounded-3xl text-center">
        <p className="text-orange-400">{t('productNotFound')}</p>
        <Link href="/admin/products">
          <button className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl">{t('backToProducts')}</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <button className="w-12 h-12 bg-orange-900/60 rounded-2xl flex items-center justify-center border border-orange-700/50 hover:bg-orange-800 transition-all">
              <ArrowLeft size={20} className="text-orange-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-orange-50">{product.name}</h1>
            <p className="text-sm text-orange-400/60">{t('prodDetailTitle')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/products/${product.id}/edit`}>
            <button className="h-12 px-6 bg-orange-600 text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-orange-500 transition-all">
              <Edit size={18} /> {t('edit')}
            </button>
          </Link>
          <button onClick={handleDelete} className="h-12 px-6 bg-red-500/20 text-red-400 rounded-xl font-black text-sm uppercase hover:bg-red-500 hover:text-white transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div className="w-full h-64 md:h-80 rounded-[2.5rem] overflow-hidden bg-orange-900/50 relative">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
        ) : (
          <Image 
            src={`https://placehold.co/800x500/065946/34D399?text=${encodeURIComponent(product.name || 'Product')}`}
            alt={product.name}
            fill
            className="object-cover opacity-90"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        )}
      </div>

      {/* Product Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#3d260a] p-6 rounded-[2rem] border border-orange-800/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/60 mb-2">Type</p>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${getTypeBadgeClass(product.type)} rounded-lg flex items-center justify-center`}>
              {getTypeIcon(product.type)}
            </div>
            <span className="font-black text-orange-50 uppercase">{product.type}</span>
          </div>
        </div>
        
        <div className="bg-[#3d260a] p-6 rounded-[2rem] border border-orange-800/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/60 mb-2">Brand</p>
          <p className="font-black text-xl text-orange-50">{product.brand || '-'}</p>
        </div>
        
        <div className="bg-[#3d260a] p-6 rounded-[2rem] border border-orange-800/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/60 mb-2">Model</p>
          <p className="font-black text-xl text-orange-50">{product.model || '-'}</p>
        </div>
        
        <div className="bg-[#3d260a] p-6 rounded-[2rem] border border-orange-800/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/60 mb-2">Power</p>
          <p className="font-black text-xl text-orange-50">{product.power_kw ? `${product.power_kw} kW` : '-'}</p>
        </div>
        
        <div className="bg-[#3d260a] p-6 rounded-[2rem] border border-orange-800/50 col-span-2 md:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/60 mb-2">Price</p>
          <p className="font-black text-2xl text-orange-400">{formatPrice(product.price_thb)}</p>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-[#3d260a] p-8 rounded-[2.5rem] border border-orange-800/50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400/60 mb-4">Description</h3>
          <p className="text-orange-100 leading-relaxed">{product.description}</p>
        </div>
      )}
    </div>
  );
}