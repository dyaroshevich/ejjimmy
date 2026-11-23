'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Zap, 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  Package, 
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  List,
  Image as ImageIcon,
  FileText,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { supabase , sbBucket } from '@/lib/supabase';
import { useTranslations } from 'next-intl';

interface MediaAsset {
  type: 'image' | 'video' | 'pdf';
  url: string;
  label?: string;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const t = useTranslations('admin');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    type: 'package' as const,
    power_kw: '',
    price_thb: '',
    specifications: {} as Record<string, any>,
    additional_info: {} as Record<string, any>,
    media: [] as MediaAsset[],
    image_url: '',
    description: '',
    locale: 'th'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `assets/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (idx !== undefined) {
        // Update existing media slot
        const next = [...formData.media];
        next[idx].url = publicUrl;
        setFormData(p => ({ ...p, media: next }));
      } else {
        // Add as new media
        setFormData(p => ({
          ...p,
          media: [...p.media, { type: 'image', url: publicUrl }]
        }));
      }
    } catch (err: any) {
      alert(t('uploadFail') + err.message);
    } finally {
      setUploading(false);
    }
  };

       async function fetchProduct() {
         setLoading(true);
         try {
           const { data, error } = await supabase
             .from('solar_products')
             .select('*')
             .eq('id', params.id)
             .single();

           if (error) throw error;
if (data) {
             // Handle both possible data structures:
             // 1. New structure: image_url and gallery fields at top level
             // 2. Old structure: media stored in specifications._media
             
             let imageUrl = data.image_url || '';
             let mediaFromGallery = [];
             
             // If we have image_url and gallery fields (new structure)
             if (data.image_url !== undefined || data.gallery !== undefined) {
               imageUrl = data.image_url || '';
               const gallery = data.gallery || [];
               mediaFromGallery = gallery.map((url: string) => ({
                 type: 'image' as const,
                 url,
                 label: undefined
               }));
             } 
             // Otherwise, check if media is stored in specifications._media (old structure)
             else {
               const specs = data.specifications || {};
               const media = specs._media || [];
               mediaFromGallery = media.map((item: any) => ({
                 type: item.type || 'image',
                 url: item.url || '',
                 label: item.label || undefined
               }));
               // If we found media in specifications, use that as the main image too
               if (!imageUrl && mediaFromGallery.length > 0) {
                 imageUrl = mediaFromGallery[0].url;
               }
             }

             // Extract specifications (technical specs only, removing media/additional_info if present)
             const specs = { ...(data.specifications || {}) };
             const displaySpecs = { ...specs };
             delete displaySpecs._media;
             delete displaySpecs._additional_info;
             
             // Extract additional_info if it exists in specifications
             const addInfo = specs._additional_info || {};

             setFormData({
               name: data.name || '',
               brand: data.brand || '',
               model: data.model || '',
               type: data.type,
               power_kw: data.power_kw != null ? String(data.power_kw) : '',
               price_thb: data.price_thb != null ? String(data.price_thb) : '',
               specifications: displaySpecs,  // Technical specs only
               additional_info: addInfo,
               media: mediaFromGallery,       // From either gallery array or specifications._media
               image_url: imageUrl,           // From image_url field or first media item
               description: data.description || '',
               locale: data.locale || 'th'
              });
            }
        }
        catch (err) {
          console.error('Error fetching:', err);
          setError(t('productNotFoundErr'));
        }
        finally {
          setLoading(false);
        }
      }
     
      const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    
    try {
      const finalSpecs = {
        ...formData.specifications,
        _media: formData.media,
        _additional_info: formData.additional_info
      };

      const { error } = await supabase
        .from('solar_products')
        .update({
          name: formData.name,
          brand: formData.brand,
          model: formData.model,
          type: formData.type,
          power_kw: formData.power_kw ? parseFloat(formData.power_kw) : null,
          price_thb: formData.price_thb ? parseInt(formData.price_thb) : null,
          specifications: finalSpecs,
          image_url: formData.image_url,
          description: formData.description,
          locale: formData.locale,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSpecField = () => {
    const newKey = `spec_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [newKey]: '' }
    }));
  };

  const updateSpecKey = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey) return;
    setFormData(prev => {
      const next = { ...prev.specifications };
      next[newKey] = next[oldKey];
      delete next[oldKey];
      return { ...prev, specifications: next };
    });
  };

  const updateSpecValue = (key: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: val }
    }));
  };

  const addExtraField = () => {
    const newKey = `info_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      additional_info: { ...prev.additional_info, [newKey]: '' }
    }));
  };

  const updateExtraKey = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey) return;
    setFormData(prev => {
      const next = { ...prev.additional_info };
      next[newKey] = next[oldKey];
      delete next[oldKey];
      return { ...prev, additional_info: next };
    });
  };

  const updateExtraValue = (key: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      additional_info: { ...prev.additional_info, [key]: val }
    }));
  };

  if (!mounted) return null;

return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-black pb-32">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-24 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <Link href="/admin">
              <button className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center border border-slate-200 transition-all active:scale-95 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">Editor</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5 opacity-80">{formData.name || 'Loading Product...'}</p>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`h-12 px-8 rounded-2xl font-black text-[11px] uppercase flex items-center gap-3 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] transition-all active:scale-95 ${success ? 'bg-orange-500 text-white' : 'bg-amber-400 text-black hover:bg-amber-300 hover:-translate-y-0.5'}`}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {success ? 'Saved!' : 'Save Progress'}
            </button>
</div>

                {/* Locale */}
                <div className="space-y-2">
                  <label htmlFor="productLocale" className="text-[9px] font-black uppercase tracking-[0.2em] ml-4 opacity-40">Content Locale</label>
                  <select 
                    id="productLocale"
                    value={formData.locale}
                    onChange={(e) => setFormData(p => ({ ...p, locale: e.target.value }))}
                    className="w-full bg-white border-2 border-slate-200 focus:border-orange-500 rounded-xl px-4 h-12 font-bold text-sm outline-none transition-all text-slate-900"
                  >
                    <option value="th">Thai (ไทย)</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="zh-CN">中文</option>
                  </select>
                </div>
              </div>
       </header>

<main className="flex-1 p-4 md:p-6 relative z-10">
  <div className="max-w-3xl mx-auto space-y-8">
          
{error && (
             <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-600 shadow-sm">
               <AlertCircle size={20} />
               <p className="text-sm font-bold uppercase tracking-wider">{error}</p>
             </div>
           )}

{/* HERO IMAGE */}
            <div className="relative w-full h-48 md:h-64 rounded-[2.5rem] overflow-hidden bg-slate-100 mb-8">
              {formData.image_url ? (
                <Image src={formData.image_url} alt={formData.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
              ) : (
                <Image 
                  src={`https://placehold.co/800x500/065946/34D399?text=${encodeURIComponent(formData.name || 'Product Image')}`}
                  alt="Placeholder"
                  fill
                  className="object-cover opacity-80"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              )}
             <div className="absolute bottom-4 left-4 right-4 flex gap-2">
               <input 
                 type="text" 
                 value={formData.image_url} 
                 onChange={(e) => setFormData(p => ({ ...p, image_url: e.target.value }))}
                 placeholder="Paste image URL here..."
                 className="flex-1 bg-white backdrop-blur-md border border-slate-200 rounded-xl px-4 h-12 text-slate-900 placeholder:text-slate-400"
               />
             </div>
           </div>

{/* CORE IDENTITY SECTION */}
           <section className="space-y-4">
             <div className="flex items-center gap-3 px-2">
               <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-slate-200">
                 <Zap size={16} fill="currentColor" />
               </div>
               <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Core Identity</h2>
             </div>

             <div className="bg-white backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm space-y-6">
               <div className="space-y-2">
                 <label htmlFor="productCommercialName" className="text-[9px] font-black uppercase tracking-[0.2em] ml-4 opacity-40">Product Commercial Name</label>
                 <input id="productCommercialName" 
                   type="text" 
                   value={formData.name} 
                   onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} 
                   className="w-full bg-white border-2 border-slate-200 focus:border-orange-500 rounded-xl px-4 h-12 font-black text-xl outline-none transition-all shadow-inner text-slate-900 placeholder:text-slate-400"
                   placeholder="ENTER NAME..." 
                 />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label htmlFor="brandManufacturer" className="text-[9px] font-black uppercase tracking-[0.2em] ml-4 opacity-40">Brand Manufacturer</label>
                   <input id="brandManufacturer" type="text" value={formData.brand} onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))} className="w-full bg-white border-2 border-slate-200 focus:border-orange-500 rounded-xl px-4 h-12 font-bold text-sm outline-none transition-all text-slate-900" placeholder="HUAWEI, JINKO..." />
                 </div>
                 <div className="space-y-2">
                   <label htmlFor="modelDesignation" className="text-[9px] font-black uppercase tracking-[0.2em] ml-4 opacity-40">Model Designation</label>
                   <input id="modelDesignation" type="text" value={formData.model} onChange={(e) => setFormData(p => ({ ...p, model: e.target.value }))} className="w-full bg-white border-2 border-slate-200 focus:border-orange-500 rounded-xl px-4 h-12 font-bold text-sm outline-none transition-all text-slate-900" placeholder="SUN2000-5KTL..." />
                 </div>
               </div>

               {/* Product Image URL */}
               <div className="space-y-2">
                 <label htmlFor="imageUrl" className="text-[9px] font-black uppercase tracking-[0.2em] ml-4 opacity-40">Product Image (Main)</label>
                 <div className="flex gap-3">
                   <input 
                     id="imageUrl"
                     type="text" 
                     value={formData.image_url} 
                     onChange={(e) => setFormData(p => ({ ...p, image_url: e.target.value }))} 
                     className="flex-1 bg-white border-2 border-slate-200 focus:border-orange-500 rounded-xl px-4 h-12 font-bold text-sm outline-none transition-all text-slate-900 placeholder:text-slate-400" 
                     placeholder="https://example.com/image.jpg"
                   />
                   <label className="w-12 h-12 bg-orange-600 hover:bg-orange-500 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">
                     <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                       const file = e.target.files?.[0];
                       if (!file) return;
                       setUploading(true);
                       try {
                         const fileExt = file.name.split('.').pop();
                         const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                         const { data, error: uploadError } = await supabase.storage.from(sbBucket('products')).upload(`assets/${fileName}`, file);
                         if (uploadError) throw uploadError;
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
                 {formData.image_url || (formData.media && formData.media[0]?.url) ? (
                    <div className="mt-2 aspect-video max-w-sm rounded-xl overflow-hidden border border-slate-200 relative">
                      <Image 
                        src={formData.image_url || formData.media[0]?.url} 
                        alt="Product preview" 
                        fill
                        className="object-cover"
                        sizes="384px"
                      />
                    </div>
                 ) : (
                   <div className="mt-2 aspect-video max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                     <Package size={32} className="text-slate-400"/>
                   </div>
                 )}
               </div>
             </div>
           </section>

{/* PERFORMANCE & VALUE */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-slate-300 transition-all">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Peak Power</p>
               <div className="flex items-baseline gap-2">
                 <input type="number" value={formData.power_kw} onChange={(e) => setFormData(p => ({ ...p, power_kw: e.target.value }))} className="w-20 bg-transparent border-none text-3xl font-black text-slate-900 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                 <span className="text-lg font-black text-orange-500 italic">kW</span>
               </div>
               <div className="mt-2 w-10 h-0.5 bg-orange-800 rounded-full overflow-hidden">
                 <div className="h-full bg-amber-400 w-1/2 shadow-[0_0_5px_#fbbf24]" />
               </div>
             </div>

             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-slate-300 transition-all">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Market Price</p>
               <div className="flex items-baseline gap-2">
                 <span className="text-lg font-black text-orange-500 italic">฿</span>
                 <input type="number" value={formData.price_thb} onChange={(e) => setFormData(p => ({ ...p, price_thb: e.target.value }))} className="w-28 bg-transparent border-none text-2xl font-black text-slate-900 text-center outline-none" />
               </div>
               <div className="mt-2 px-3 py-1 bg-orange-900/50 rounded-full border border-orange-800 text-[9px] font-black uppercase tracking-widest text-orange-400">
                 THB Currency
               </div>
             </div>
           </div>

{/* MEDIA ASSETS */}
           <section className="space-y-4">
             <div className="flex justify-between items-center px-2">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-slate-200">
                   <ImageIcon size={16} />
                 </div>
                 <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Media Assets</h2>
               </div>
               <div className="flex gap-2">
                 <label className="w-10 h-10 bg-orange-600 text-black rounded-xl flex items-center justify-center hover:bg-orange-500 transition-all active:scale-90 shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-pointer">
                   <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e)} disabled={uploading} />
                   {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} strokeWidth={3} />}
                 </label>
               </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {formData.media.map((item, idx) => (
                 <div key={idx} className="bg-white backdrop-blur-sm p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all group relative overflow-hidden text-left">
                   <div className="flex items-center justify-between mb-2">
                     <select 
                       value={item.type}
                       onChange={(e) => {
                         const next = [...formData.media];
                         next[idx].type = e.target.value as any;
                         setFormData(p => ({ ...p, media: next }));
                       }}
                       className="bg-white text-orange-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase outline-none border border-slate-200 appearance-none cursor-pointer"
                     >
                       <option value="image">📸 Image</option>
                       <option value="video">🎥 Video</option>
                       <option value="pdf">📄 PDF</option>
                     </select>
                     <div className="flex gap-2">
                       <label className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-500/20 text-orange-400/50 hover:text-orange-400 transition-all cursor-pointer">
                         <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, idx)} disabled={uploading} />
                         <ImageIcon size={14} />
                       </label>
                       <button 
                         onClick={() => setFormData(p => ({ ...p, media: p.media.filter((_, i) => i !== idx) }))}
                         className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-400/50 hover:text-red-400 transition-all"
                       >
                         <Trash2 size={14} />
                       </button>
                     </div>
                   </div>
                   
                   <div className="relative">
                     <input 
                       type="text" 
                       placeholder="HTTPS://..." 
                       value={item.url}
                       onChange={(e) => {
                         const next = [...formData.media];
                         next[idx].url = e.target.value;
                         setFormData(p => ({ ...p, media: next }));
                       }}
                       className="w-full bg-white text-slate-900 border border-slate-200 focus:border-orange-500 rounded-xl px-3 py-2 text-[9px] font-bold outline-none font-mono"
                     />
                   </div>

                    {item.url && item.type === 'image' && (
                      <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-inner group-hover:scale-[1.01] transition-transform relative">
                        <Image
                          src={item.url}
                          alt={`Product image preview: ${item.label || 'Unnamed'}`}
                          fill
                          className="object-cover grayscale-[0.1] hover:grayscale-0 transition-all"
                          sizes="(max-width: 768px) 100vw, 384px"
                        />
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </section>

{/* TECHNICAL SPECS */}
           <section className="space-y-4">
             <div className="flex justify-between items-center px-2">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-slate-200">
                   <List size={16} />
                 </div>
                 <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Technical Specs</h2>
               </div>
               <button onClick={addSpecField} className="w-8 h-8 bg-slate-100 border border-slate-200 text-orange-600 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all">
                 <Plus size={18} />
               </button>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
               {Object.entries(formData.specifications).map(([key, value]) => (
                 <div key={key} className="flex flex-col sm:flex-row items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-all">
                   <input 
                     type="text" 
                     defaultValue={key.startsWith('spec_') ? '' : key}
                     onBlur={(e) => updateSpecKey(key, e.target.value)}
                     placeholder="FIELD"
                     className="w-full sm:w-1/3 bg-white border border-slate-200 rounded-xl px-3 h-10 text-[9px] font-black uppercase tracking-widest text-slate-600 outline-none focus:border-orange-500"
                   />
                   <div className="flex-1 flex items-center gap-2 w-full">
                     <input 
                       type="text" 
                       value={String(value)}
                       onChange={(e) => updateSpecValue(key, e.target.value)}
                       placeholder="VALUE"
                       className="flex-1 bg-transparent px-3 h-10 font-bold text-sm text-slate-900 outline-none border-b border-slate-200 focus:border-orange-500 transition-all"
                     />
                     <button onClick={() => {
                       const next = { ...formData.specifications };
                       delete next[key];
                       setFormData(p => ({ ...p, specifications: next }));
                     }} className="w-8 h-8 flex items-center justify-center text-red-500/40 hover:text-red-500 transition-all">
                       <Trash2 size={14} />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           </section>

{/* EXTRA CUSTOM FIELDS */}
           <section className="space-y-4">
             <div className="flex justify-between items-center px-2">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 border border-slate-200">
                   <FileText size={16} />
                 </div>
                 <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Extended Information</h2>
               </div>
               <button onClick={addExtraField} className="w-8 h-8 bg-amber-400 text-black rounded-xl flex items-center justify-center hover:bg-amber-300 transition-all">
                 <Plus size={18} strokeWidth={2} />
               </button>
             </div>

             <div className="space-y-6">
               {Object.entries(formData.additional_info).map(([key, value]) => (
                 <div key={key} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                   <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                     <input 
                       type="text" 
                       defaultValue={key.startsWith('info_') ? '' : key}
                       onBlur={(e) => updateExtraKey(key, e.target.value)}
                       className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 w-full"
                       placeholder="FIELD LABEL..."
                     />
                     <button onClick={() => {
                       const next = { ...formData.additional_info };
                       delete next[key];
                       setFormData(p => ({ ...p, additional_info: next }));
                     }} className="text-red-500/40 hover:text-red-500 p-2"><Trash2 size={14}/></button>
                   </div>
                   <div className="p-4">
                     <textarea 
                       value={String(value)}
                       onChange={(e) => updateExtraValue(key, e.target.value)}
                       className="w-full bg-transparent border-none outline-none text-slate-700 font-medium text-sm min-h-[80px] resize-none leading-relaxed placeholder:text-slate-400"
                       placeholder="Describe technical details, features or installation requirements..."
                     />
                   </div>
                 </div>
               ))}
             </div>
           </section>

{/* DANGER ZONE */}
           <section className="pt-8 border-t border-red-200">
             <button 
               onClick={async () => {
                 if(confirm('This action cannot be undone. Delete permanently?')) {
                   await supabase.from('solar_products').delete().eq('id', params.id);
                   window.location.href = '/admin';
                 }
               }}
               className="w-full h-16 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-900 border-2 border-red-200 transition-all font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2 shadow-md active:scale-95"
             >
               <Trash2 size={16} /> Erase Data Forever
              </button>
              </section>
           </div>
         </main>
       </div>
     );
}
