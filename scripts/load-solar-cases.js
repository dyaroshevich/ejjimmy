require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://odolxtryjmfpzfmuhngo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function loadCases() {
    const casesDir = path.join(__dirname, '../media-source/cases');
    const cases = fs.readdirSync(casesDir);

    for (const slug of cases) {
        const casePath = path.join(casesDir, slug);
        if (!fs.lstatSync(casePath).isDirectory()) continue;

        console.log(`Processing case: ${slug}`);
        
        // Scan for assets in root, gallery/, and video/
        const rootFiles = fs.readdirSync(casePath);
        const galleryPath = path.join(casePath, 'gallery');
        const videoPath = path.join(casePath, 'video');

        const galleryFiles = fs.existsSync(galleryPath) ? fs.readdirSync(galleryPath) : [];
        const videoFiles = fs.existsSync(videoPath) ? fs.readdirSync(videoPath) : [];

        const mediaAssets = {
            cover: rootFiles.find(f => f.startsWith('cover')) || '',
            gallery: galleryFiles.filter(f => f.endsWith('.jpg') || f.endsWith('.png')),
            video: videoFiles.find(f => f.endsWith('.mp4') || f.endsWith('.mov')) || ''
        };

        const caseData = {
            slug,
            media_assets: mediaAssets
        };

        const { data, error } = await supabase
            .from('solar_cases')
            .upsert(caseData, { onConflict: 'slug' });

        if (error) console.error(`Error updating media for ${slug}:`, error);
        else console.log(`Successfully updated media for ${slug}:`, mediaAssets);
    }
}

loadCases();
