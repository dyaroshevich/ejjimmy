-- Hide Sofin-related blog posts (feature flag: NEXT_PUBLIC_SHOW_SOFIN=false)
-- To restore: UPDATE blog_posts SET published = true WHERE slug IN ('solar-financing-incentives-thailand-2026', '5-solar-misconceptions-krabi');
UPDATE blog_posts SET published = false WHERE slug IN ('solar-financing-incentives-thailand-2026', '5-solar-misconceptions-krabi');
