'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, Edit, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ProductsPage() {
  const t = useTranslations('admin');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('ejjimmy_products').select('*').order('name', { ascending: true });
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
            <Link href="/admin"><Button variant="ghost" className="rounded-full text-slate-500 dark:text-orangeNoir-textMuted hover:text-orange-600 dark:hover:text-orangeNoir-text hover:bg-slate-50 dark:hover:bg-orange-900/30"><ArrowLeft size={18}/></Button></Link>
            <h2 className="text-2xl font-black text-slate-950 dark:text-orangeNoir-text uppercase tracking-tighter">{t('productsTitle')}</h2>
        </div>
        <Link href="/admin/products/new">
            <Button className="rounded-full bg-orange-600 text-white font-black uppercase px-6 hover:bg-orange-500">
                <Plus size={16} className="mr-1"/> {t('addProduct')}
            </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-200 dark:border-orangeNoir-border shadow-sm overflow-hidden text-left">
        {loading ? (
          <div className="p-24 text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-orange-500" size={40}/>
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">{t('loadingProducts')}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-24 text-center">
             <Package className="mx-auto mb-4 text-slate-200 dark:text-orange-950" size={48}/>
             <p className="text-sm font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-wider">{t('noProducts')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-orangeNoir-border/30">
            {products.map(product => (
              <div key={product.id} className="p-5 md:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-orange-900/10 transition-all group">
                <Link href={`/admin/products/${product.id}/edit`} className="flex-1 min-w-0 flex items-center gap-4">      
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-orangeNoir-input border border-slate-100 dark:border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Image 
                      src={product.image_url || `/content/products/${product.id}/main.webp`} 
                      alt={product.name} 
                      width={48}
                      height={48}
                      className="w-full h-full object-contain p-1 opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-bold text-sm text-slate-900 dark:text-orangeNoir-text truncate tracking-tight">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-slate-400 dark:text-orange-900 uppercase tracking-widest">{product.brand}</span>
                      <span className="opacity-30 text-slate-300">•</span>
                      <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">฿{Number(product.price_thb || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
                
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <div className="p-2.5 bg-slate-50 dark:bg-orangeNoir-input text-slate-300 dark:text-orange-900 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/40 transition-all border border-transparent group-hover:border-orange-100 dark:group-hover:border-orange-800 rounded-xl">
                      <Edit size={18}/>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

