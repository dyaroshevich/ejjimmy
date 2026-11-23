import { getLocale, getTranslations } from 'next-intl/server';
import { FEATURES } from '@/lib/feature-flags';
import { getSite } from '@/lib/site-server';
import { service, warranty } from '@/lib/domain.config';

export default async function JsonLd() {
  const locale = await getLocale();
  const tBrand = await getTranslations('header');
  const tMeta = await getTranslations('meta');
  const { brand, contact, address, url } = getSite();
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": locale === 'th' ? tBrand('brandTop') : brand.name,
    "alternateName": locale === 'th' ? brand.name : tBrand('brandTop'),
    "description": tMeta('description'),
    "url": url,
    "telephone": contact.phoneE164,
    "email": contact.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": address.city,
      "addressRegion": address.region,
      "addressCountry": address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": String(address.geo.lat),
      "longitude": String(address.geo.lng)
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": service.opensAt,
      "closes": service.closesAt,
      "description": "Available 24/7 via LINE and Chat"
    },
    "priceRange": service.priceRange,
    // The last entry is a region, not a city — schema.org has a type for that, and claiming Phuket as a
    // district would be a different statement from claiming it as a further catchment.
    "areaServed": service.areaServed.map((name, i) => ({
      "@type": i === service.areaServed.length - 1 ? "AdministrativeArea" : "City",
      "name": name
    })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Solar Panel Systems",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Residential Solar Systems",
            "description": "3kW - 30kW systems for homes and villas"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Commercial Solar Systems",
            "description": "20kW - 100kW systems for businesses and hotels"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Industrial Solar Systems",
            "description": "100kW+ systems for factories and large properties"
          }
        }
      ]
    },
    "sameAs": [
      contact.lineUrl
    ]
  };

  // FAQ answers are Thai-only content — emit the FAQ schema only for th
  // so crawlers never see wrong-language structured data.
  if (locale !== 'th') {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
    );
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "ติดตั้งโซลาร์เซลล์ใช้เวลานานแค่ไหน?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "การติดตั้งโซลาร์เซลล์ใช้เวลาประมาณ 1-3 วัน ขึ้นอยู่กับขนาดระบบ และความพร้อมของหลังคา"
        }
      },
      ...(FEATURES.sofin ? [{
        "@type": "Question",
        "name": "ผ่อนชำระได้ไหม?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ใช่ สามารถผ่อนชำระได้สูงสุด 84 เดือน ดาวน์เพียง 10% พร้อมดอกเบี้ย 0% ผ่าน Sofin"
        }
      }] : []),
      {
        "@type": "Question",
        "name": "ค่าไฟจะลดลงเท่าไหร่?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "โดยเฉลี่ยลูกค้าประหยัดค่าไฟได้ 50-70% ต่อเดือน ขึ้นอยู่กับขนาดระบบและการใช้งาน"
        }
      },
      {
        "@type": "Question",
        "name": "มีประกันไหม?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `ใช่ แผงโซลาร์มีประกัน ${warranty.panels[0]}-${warranty.panels[1]} ปี อินเวอร์เตอร์มีประกัน ${warranty.inverter[0]}-${warranty.inverter[1]} ปี และงานติดตั้งมีประกัน ${warranty.installation} ปี`
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}