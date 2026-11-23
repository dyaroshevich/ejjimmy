'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Radio, 
  RadioGroup, 
  RadioGroupLabel, 
  RadioGroupItem, 
  Checkbox, 
  CheckboxGroup, 
  CheckboxGroupLabel, 
  CheckboxGroupItem,
  Input,
  Textarea,
  Button,
  Label,
  Switch,
  Separator,
  Alert,
  AlertDescription,
  AlertTitle,
  VStack,
  HStack,
  Toast,
  toast,
  Badge
} from '@/components/ui';
import { 
  MessageSquare,
  Mic,
  Send,
  Check,
  List,
  Clipboard,
  Music,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Palette,
  FileText,
  Lock,
  Camera,
  Image as ImageIcon,
  Rocket,
  Settings,
  Scale,
  Users,
  Target,
  Globe,
  ArrowRight,
  Loader2,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Question {
  id: string;
  section: string;
  type: 'text' | 'multiple' | 'file'; // All choices are now multiple for flexibility
  prompt: string;
  description?: string;
  options?: string[];
  placeholder?: string;
}

interface Answers {
  [questionId: string]: string | string[] | any | null;
}

import { useSite } from '@/lib/site-context';

export function QuizTab() {
  const { brand } = useSite();
  const [journey, setJourney] = useState<'welcome' | 'loading' | 'questions' | 'saving' | 'results'>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const questions: Question[] = [
    {
      id: 'ai_avatar_usage',
      section: 'AI & Avatar "แทน"',
      type: 'multiple',
      prompt: 'สิทธิ์ในการใช้งาน AI Avatar และแบรนด์',
      description: 'เราสามารถดำเนินการในส่วนใดได้บ้างภายใต้แบรนด์ของคุณ? (เลือกได้หลายข้อ)',
      options: [
        'สร้าง AI Avatar ประจำแบรนด์',
        'สร้างคอนเทนต์ภายใต้แบรนด์หลัก',
        'สร้างแบรนด์ย่อยเฉพาะพื้นที่กระบี่ (Sub-brand)',
        'ทดลองดีไซน์และคอนเซปต์การตลาดใหม่ๆ',
        'ทุกอย่างต้องได้รับการอนุมัติเป็นรายกรณี'
      ]
    },
    {
      id: 'ai_restrictions',
      section: 'AI & Avatar "แทน"',
      type: 'multiple',
      prompt: 'หัวข้อที่ต้องการให้ AI "สั่งห้าม" (Blacklist)',
      description: 'AI ควรหลีกเลี่ยงหรือปฏิเสธการตอบคำถามในหัวข้อใด? (เลือกได้หลายข้อ)',
      options: ['การเมือง', 'ศาสนา', 'สุขภาพ/การแพทย์', 'ข้อกำหนดการก่อสร้าง (ที่ต้องใช้ใบอนุญาต)', 'การเปรียบเทียบแบรนด์คู่แข่งในเชิงลบ']
    },
    {
      id: 'tan_persona',
      section: 'Tone of Voice',
      type: 'multiple',
      prompt: 'คุณเห็นด้วยกับบุคลิกของ "แทน" หรือไม่?',
      description: 'แทน คือเพื่อนผู้เชี่ยวชาญในกระบี่ (จริงใจ, เรียบง่าย, ไม่กดดัน)',
      options: ['เห็นด้วยอย่างยิ่ง', 'เห็นด้วย แต่ต้องการปรับจูนบางจุด', 'ต้องการโทนที่เป็นทางการมากกว่านี้', 'ต้องการโทนที่เน้นการขายมากขึ้น']
    },
    {
      id: 'brandbook_exists',
      section: 'Branding',
      type: 'multiple',
      prompt: 'สถานะ Brandbook หรือ Guideline',
      options: ['มี Brandbook ทางการ (พร้อมส่งไฟล์)', 'ไม่มี (ให้เราช่วยออกแบบตามความเหมาะสม)', 'มีบางส่วน (เช่น โลโก้และสีเท่านั้น)']
    },
    {
      id: 'brand_flexibility',
      section: 'Branding',
      type: 'multiple',
      prompt: 'ความยืดหยุ่นในการใช้ตราสัญลักษณ์ (Logo)',
      description: 'เราสามารถปรับแต่งโลโก้เพื่อการทำสื่อได้แค่ไหน? (เลือกได้หลายข้อ)',
      options: [
        'ใช้ตามต้นฉบับเท่านั้น (ห้ามปรับแต่ง)',
        'ปรับเปลี่ยนสีให้เข้ากับธีมคอนเทนต์ได้',
        'ปรับสัดส่วนหรือลดทอนส่วนประกอบได้',
        'ใช้ในสื่อโปรโมททุกประเภทของเราได้'
      ]
    },
    {
      id: 'content_approval',
      section: 'Content Strategy',
      type: 'multiple',
      prompt: 'ขั้นตอนการตรวจทานคอนเทนต์',
      description: 'คุณต้องการมีส่วนร่วมในการอนุมัติสื่อมากน้อยเพียงใด?',
      options: ['ต้องอนุมัติทุกชิ้นงานก่อนโพสต์', 'อนุมัติเฉพาะชิ้นงานสำคัญ', 'ไม่ต้องอนุมัติ (เชื่อใจในทีมงาน)']
    },
    {
      id: 'asset_usage',
      section: 'Assets',
      type: 'multiple',
      prompt: 'การใช้งานภาพหน้างานจริง',
      description: 'เราสามารถเข้าถึงและใช้งานภาพถ่ายโครงการที่ผ่านมาได้หรือไม่?',
      options: [
        'ใช้ได้ทันทีทุกโครงการ',
        'ใช้ได้เฉพาะโครงการที่ขออนุญาตลูกค้าแล้ว',
        'ต้องการให้ทีมงานสร้างกราฟิกจำลองขึ้นใหม่เอง'
      ]
    },
    {
      id: 'additional_notes',
      section: 'Final Notes',
      type: 'text',
      prompt: 'ข้อเสนอแนะหรือความต้องการเพิ่มเติม',
      description: 'บอกสิ่งที่คุณต้องการ "เป็นพิเศษ" หรือหัวข้อที่เราควรระวัง',
      placeholder: 'พิมพ์ข้อความของคุณที่นี่... (ข้ามได้หากไม่มี)'
    }
  ];

  const roadmapStages = [
    { id: 1, title: 'แบรนด์และตัวตน', active: true, icon: <Palette size={16} /> },
    { id: 2, title: 'การดำเนินงานและขาย', active: false, icon: <Rocket size={16} /> },
    { id: 3, title: 'การตลาดเนื้อหา', active: false, icon: <FileText size={16} /> },
    { id: 4, title: 'กฎหมายและ PDPA', active: false, icon: <Scale size={16} /> },
    { id: 5, title: 'ระบบเชื่อมต่อ', active: false, icon: <Settings size={16} /> },
    { id: 6, title: 'สินค้าและราคา', active: false, icon: <Target size={16} /> },
    { id: 7, title: 'กลุ่มลูกค้า', active: false, icon: <Users size={16} /> },
    { id: 8, title: 'เป้าหมายและตัวชี้วัด', active: false, icon: <Globe size={16} /> },
  ];

  // Load existing data on mount
  useEffect(() => {
    async function loadBrief() {
      setJourney('loading');
      try {
        const { data, error } = await supabase
          .from('system_configs')
          .select('value')
          .eq('key', 'business_brief')
          .single();
        
        if (data?.value) {
          setAnswers(data.value.answers || {});
          if (data.value.isCompleted) setJourney('results');
          else setJourney('welcome');
        } else {
          setJourney('welcome');
        }
      } catch (e) {
        setJourney('welcome');
      }
    }
    loadBrief();
  }, []);

  const saveToSupabase = async (currentAnswers: Answers, isCompleted = false) => {
    setIsAutoSaving(true);
    try {
      await supabase.from('system_configs').upsert({
        key: 'business_brief',
        value: { answers: currentAnswers, isCompleted, updatedAt: new Date().toISOString() },
        updated_at: new Date().toISOString()
      });
      toast({ title: 'บันทึกสำเร็จ', description: 'ข้อมูลของคุณได้รับการบันทึกแล้ว', duration: 2000 });
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Optional: auto-save every step
      saveToSupabase(answers, false);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleFinalSubmit = async () => {
    setJourney('saving');
    await saveToSupabase(answers, true);
    setJourney('results');
  };

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดใช่หรือไม่?')) {
      setCurrentIndex(0);
      setAnswers({});
      saveToSupabase({}, false);
      setJourney('welcome');
    }
  };

  if (journey === 'loading') {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center">
        <Loader2 size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">กำลังโหลดข้อมูลบรีฟ...</p>
      </div>
    );
  }

  if (journey === 'welcome') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-12 px-6 text-center space-y-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl"
      >
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mx-auto text-orange-600 shadow-inner">
          <Rocket size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">ยินดีต้อนรับสู่ {brand.name} Brief</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
            แบบสอบถามนี้จะช่วยให้เราตั้งค่าระบบ AI และวางแผนการตลาดให้ตรงกับธุรกิจของคุณมากที่สุด <br />
            <span className="text-orange-600">ใช้เวลาประมาณ 15 นาที และคุณสามารถบันทึกเพื่อมาทำต่อภายหลังได้</span>
          </p>
        </div>
        <div className="pt-6">
          <Button 
            onClick={() => setJourney('questions')}
            className="h-16 px-12 rounded-full bg-orange-600 text-white font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20"
          >
            {Object.keys(answers).length > 0 ? 'ทำบรีฟต่อ' : 'เริ่มกรอกบรีฟ'} <ArrowRight size={20} className="ml-3" />
          </Button>
        </div>
      </motion.div>
    );
  }

  if (journey === 'saving') {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center space-y-8 animate-in fade-in duration-500">
        <Loader2 size={64} className="animate-spin text-orange-500 mx-auto" />
        <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase">กำลังบันทึกข้อมูล...</h2>
      </div>
    );
  }

  if (journey === 'results') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto text-white shadow-lg rotate-3">
            <Check size={40} strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">ส่งบรีฟสำเร็จ!</h2>
          <p className="text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">ข้อมูลของคุณถูกส่งเข้าระบบเรียบร้อยแล้ว ทีมงานจะใช้เวลาประมวลผลประมาณ 24 ชม. เพื่อเปิดขั้นตอนถัดไป</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roadmapStages.map((stage) => (
            <div 
              key={stage.id}
              className={`relative p-5 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center text-center gap-3 ${stage.active ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-400 opacity-60'}`}
            >
              {!stage.active && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px] rounded-[2rem] z-10 group cursor-help">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
                    <Lock size={16} />
                  </div>
                  <div className="absolute bottom-full mb-2 hidden group-hover:block w-40 bg-slate-800 text-white text-[9px] p-2 rounded-lg z-20">
                    รอการยืนยันข้อมูลขั้นที่ 1
                  </div>
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stage.active ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800'}`}>
                {stage.icon}
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Stage {stage.id}</span>
                <h4 className="text-[10px] font-black uppercase tracking-tight leading-tight">{stage.title}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 pt-8">
           <Button onClick={() => setJourney('questions')} className="rounded-full px-10 h-14 font-black uppercase tracking-widest text-xs bg-slate-900 text-white">ตรวจสอบคำตอบ</Button>
           <button onClick={handleReset} className="text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-colors">รีเซ็ตและเริ่มใหม่</button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Top Controls */}
      <div className="flex justify-between items-center">
         <div className="space-y-1 flex-1 mr-8">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{q.section}</span>
              <span className="text-[10px] font-bold text-slate-400">{currentIndex + 1} / {questions.length}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-orange-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
            </div>
         </div>
         <button 
          onClick={() => saveToSupabase(answers, false)}
          disabled={isAutoSaving}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-orange-600 transition-all"
         >
           {isAutoSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
           <span className="text-[10px] font-black uppercase tracking-widest">บันทึก</span>
         </button>
      </div>

      {/* Question Card */}
      <motion.div 
        key={q.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 blur-[80px] pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
           <h3 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white leading-tight uppercase tracking-tighter">
             {q.prompt}
           </h3>
           {q.description && (
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed border-l-4 border-orange-500 pl-4">
               {q.description}
             </p>
           )}
        </div>

        <div className="space-y-6 relative z-10">
          {q.type === 'multiple' && (
            <div className="grid grid-cols-1 gap-3">
               {q.options?.map((opt, i) => {
                 const isSelected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt);
                 return (
                   <button 
                    key={i}
                    onClick={() => {
                      const current = Array.isArray(answers[q.id]) ? answers[q.id] as string[] : [];
                      const next = isSelected ? current.filter(v => v !== opt) : [...current, opt];
                      handleAnswerChange(q.id, next);
                    }}
                    className={`p-6 rounded-[2rem] border-2 text-left font-bold transition-all flex items-center justify-between active:scale-[0.98] ${isSelected ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:border-orange-500/30'}`}
                   >
                     <span>{opt}</span>
                     <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'border-white bg-white/20' : 'border-slate-300 dark:border-slate-600'}`}>
                       {isSelected && <Check size={16} strokeWidth={4} />}
                     </div>
                   </button>
                 );
               })}
            </div>
          )}

          {q.type === 'text' && (
            <div className="space-y-4">
              <Textarea 
                value={(answers[q.id] as string) || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder={q.placeholder || 'พิมพ์ข้อความของคุณที่นี่...'}
                className="min-h-[150px] p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-lg no-scrollbar"
              />
            </div>
          )}

          {q.type === 'file' && (
            <div className="flex flex-col items-center justify-center p-12 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-orange-50/30 transition-all group">
               <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:scale-110 transition-all shadow-xl mb-6">
                 <Camera size={32} />
               </div>
               <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">อัปโหลดไฟล์หรือถ่ายภาพ</p>
               <input type="file" className="hidden" id="file-upload" />
               <label htmlFor="file-upload" className="px-10 h-14 bg-orange-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center cursor-pointer hover:bg-orange-500 shadow-xl shadow-orange-600/20 transition-all active:scale-95">
                 เลือกไฟล์ <ImageIcon size={18} className="ml-2" />
               </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800 relative z-10">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white font-black uppercase tracking-widest text-[10px] disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={16} /> ย้อนกลับ
          </button>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={handleNext}
               className="text-slate-400 hover:text-orange-600 font-black uppercase tracking-widest text-[10px] transition-all mr-4"
             >
               ข้ามคำถาม
             </button>
             <Button 
               onClick={handleNext}
               className="h-14 px-10 rounded-full bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 shadow-xl shadow-orange-600/20 transition-all"
             >
               {currentIndex === questions.length - 1 ? 'ส่งบรีฟ' : 'คำถามถัดไป'} <ArrowRight size={16} className="ml-2" />
             </Button>
          </div>
        </div>
      </motion.div>

      {/* Roadmap Peek */}
      <div className="pt-12">
         <div className="flex items-center gap-4 mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400">เส้นทางการดำเนินงานของคุณ</h4>
            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
            {roadmapStages.map(stage => (
              <div key={stage.id} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap border-2 ${stage.active ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-400' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-400'}`}>
                 {stage.active ? <Sparkles size={12} /> : <Lock size={12} />}
                 <span className="text-[10px] font-black uppercase tracking-tight">{stage.title}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
