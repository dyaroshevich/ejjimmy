'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Zap, 
  ArrowLeft, 
  Save, 
  Loader2,
  Image as ImageIcon,
  Sun,
  Battery,
  Box,
  Settings,
  Circle
} from 'lucide-react';
import { supabase , sbBucket } from '@/lib/supabase';
import { useTranslations } from 'next-intl';

export default function NewProductPage() {
  const t = useTranslations('admin');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    type: 'package',
    power_kw: '',
    price_thb: '',
    image_url: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const typeOptions = [
    { value: 'package', label: 'Full Package', icon: <Box size={18} /> },
    { value: 'panel', label: 'Solar Panel', icon: <Sun size={18} /> },
    { value: 'inverter', label: 'Inverter', icon: <Zap size={18} /> },
    { value: 'battery', label: 'Battery', icon: <Battery size={18} /> },
    { value: 'system', label: 'System', icon: <Settings size={18} /> },
  ];

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase.from('solar_products').insert([{
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        type: formData.type,
        power_kw: formData.power_kw ? parseFloat(formData.power_kw) : null,
        price_thb: formData.price_thb ? parseFloat(formData.price_thb) : null,
        image_url: formData.image_url,
        description: formData.description,
      }]);
      if (error) throw error;
      window.location.href = '/admin/products';
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#1a0e00] text-orange-50 flex flex-col font-sans pb-32">
      <header className="p-6 border-b border-orange-800/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <button className="w-10 h-10 bg-orange-900/60 rounded-xl flex items-center justify-center hover:bg-orange-800">
              <ArrowLeft size={20} className="text-orange-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase">{t('newProductTitle')}</h1>
            <p className="text-[10px] text-orange-400/60">Add new product</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="h-12 px-8 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black text-sm uppercase flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {t('save')}
        </button>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Main Image */}
        <div className="bg-[#3d260a] rounded-[2.5rem] border border-orange-800/50 p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/60 mb-3">Product Image</p>
          <div className="aspect-video max-w-md mx-auto rounded-2xl overflow-hidden bg-orange-900/50 relative">
            {formData.image_url ? (
              <Image src={formData.image_url} alt="Preview" fill className="object-cover" sizes="(max-width: 672px) 100vw, 672px" />
            ) : (
              <Image 
                src={`https://placehold.co/600x400/065946/34D399?text=${encodeURIComponent(formData.name || 'Product Image')}`}
                alt="Placeholder"
                fill
                className="object-cover opacity-60"
                sizes="(max-width: 672px) 100vw, 672px"
              />
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <input 
              type="text" 
              value={formData.image_url} 
              onChange={(e) => setFormData(p => ({ ...p, image_url: e.target.value }))}
              placeholder="Image URL or leave empty for placeholder"
              className="flex-1 bg-orange-950/50 border border-orange-800/50 rounded-xl px-4 h-12 text-sm text-orange-50 placeholder:text-orange-500/40"
            />
            <label className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-orange-500">
              <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${Date.now()}.${fileExt}`;
                  const { error } = await supabase.storage.from(sbBucket('products')).upload(`assets/${fileName}`, file);
                  if (error) throw error;
                  const { data: { publicUrl } } = supabase.storage.from(sbBucket('products')).getPublicUrl(`assets/${fileName}`);
                  setFormData(p => ({ ...p, image_url: publicUrl }));
                } catch (err) {
                  console.error('Upload error:', err);
                } finally {
                  setUploading(false);
                }
              }} disabled={uploading} />
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
            </label>
          </div>
        </div>

        {/* Name & Brand */}
        <div className="bg-[#3d260a] rounded-[2.5rem] border border-orange-800/50 p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="productName" className="text-[10px] font-black uppercase text-orange-400/60">Product Name</label>
            <input id="productName" 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder={t('prodNamePh')}
              className="w-full bg-orange-950/50 border border-orange-800/50 rounded-xl px-4 h-14 text-lg font-bold text-orange-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="brand" className="text-[10px] font-black uppercase text-orange-400/60">Brand</label>
              <input id="brand" 
                type="text" 
                value={formData.brand} 
                onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))}
                placeholder="Solar Krabi"
                className="w-full bg-orange-950/50 border border-orange-800/50 rounded-xl px-4 h-12 text-orange-50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-[10px] font-black uppercase text-orange-400/60">Type</label>
              <select id="type" 
                value={formData.type}
                onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-orange-950/50 border border-orange-800/50 rounded-xl px-4 h-12 text-orange-50"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Power & Price */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#3d260a] rounded-[2rem] border border-orange-800/50 p-6">
            <label htmlFor="powerKW" className="text-[10px] font-black uppercase text-orange-400/60 block mb-2">Power (kW)</label>
            <input id="powerKW" 
              type="number" 
              value={formData.power_kw} 
              onChange={(e) => setFormData(p => ({ ...p, power_kw: e.target.value }))}
              placeholder="3"
              className="w-full bg-transparent border-none text-4xl font-black text-orange-50"
            />
          </div>
          <div className="bg-[#3d260a] rounded-[2rem] border border-orange-800/50 p-6">
            <label htmlFor="price" className="text-[10px] font-black uppercase text-orange-400/60 block mb-2">Price (฿)</label>
            <input id="price" 
              type="number" 
              value={formData.price_thb} 
              onChange={(e) => setFormData(p => ({ ...p, price_thb: e.target.value }))}
              placeholder="125000"
              className="w-full bg-transparent border-none text-4xl font-black text-orange-400"
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-[#3d260a] rounded-[2.5rem] border border-orange-800/50 p-6">
          <label htmlFor="description" className="text-[10px] font-black uppercase text-orange-400/60 block mb-2">Description</label>
          <textarea id="description" 
            value={formData.description} 
            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            placeholder={t('prodDescPh')}
            rows={4}
            className="w-full bg-transparent border-none text-orange-50 resize-none text-sm leading-relaxed placeholder:text-orange-500/30"
          />
        </div>
      </main>
    </div>
  );
}