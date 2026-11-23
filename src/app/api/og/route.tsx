import { ImageResponse } from 'next/og';
import { decodeId } from '@/lib/hashid';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';

// Server-side route: service_role client (anon RLS no longer allows leads reads)
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null as any;

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hashid = searchParams.get('hashid');

    // Default fallback content
    let topText = 'พลังงานแสงอาทิตย์ กระบี่';
    let mainTitle = 'Solar Energy Krabi';
    let subTitle = 'ติดตั้งโซลาร์เซลล์ระดับพรีเมียม';
    let footerText = 'ประเมินการประหยัดไฟฟรีด้วย AI';

    if (hashid) {
      const leadId = decodeId(hashid);
      if (leadId) {
        const { data: lead, error } = await supabaseAdmin
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (!error && lead) {
          // Customize content based on lead data
          const customerName = lead.name || 'ลูกค้า';
          const systemSize = lead.system_size ? `${lead.system_size} kW` : '';
          const location = lead.location || 'กระบี่';

          topText = `ข้อเสนอสำหรับ ${customerName}`;
          mainTitle = `${systemSize} · Solar Energy ${location}`;
          subTitle = 'ติดตั้งโซลาร์เซลล์ระดับพรีเมียม';
          footerText = `ประเมินการประหยัดไฟฟรีด้วย AI • ${customerName}`;
        }
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a0e00', // OrangeNoir DEFAULT
            padding: '40px 80px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Top Compliance Text */}
          <div
            style={{
              fontSize: 18,
              color: '#FF8A00',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 20,
            }}
          >
            {topText}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid #FF8A00',
              borderRadius: '40px',
              padding: '60px 80px',
              backgroundColor: '#3d260a',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Main Brand */}
            <div
              style={{
                fontSize: 80,
                color: 'white',
                fontWeight: 900,
                textAlign: 'center',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {mainTitle}
            </div>
            
            {/* Subtitle */}
            <div
              style={{
                fontSize: 32,
                color: '#FF8A00',
                fontWeight: 700,
                textAlign: 'center',
                marginTop: 30,
              }}
            >
              {subTitle}
            </div>

            {/* Bottom Benefit */}
            <div
              style={{
                fontSize: 24,
                color: '#FCD34D', // Amber-300 for a touch of "Gold/Elite"
                fontWeight: 600,
                textAlign: 'center',
                marginTop: 20,
                opacity: 0.9,
              }}
            >
              {footerText}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
