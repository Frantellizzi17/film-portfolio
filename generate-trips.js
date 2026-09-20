import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_DIR = './photos_source';
const PUBLIC_PHOTOS_DIR = './public/photos';
const PUBLIC_ABOUT_DIR = './public/about_me';
const OUTPUT_FILE = './src/trips.json';

const MAX_DIMENSION = 2400;
const WEBP_QUALITY = 82;

const cleanValue = (val) => {
  if (!val) return '';
  return val.replace(/\\+$/g, '').replace(/\\par/g, '').trim();
};

const cleanRTF = (content) => {
  return content
    .replace(/\\+(\r?\n)/g, '\n') // Replace backslash(es) followed by newline with a real newline
    .replace(/\\par\b/g, '\n')     // Replace RTF \par command with newline
    .replace(/\{\*?\\[^{}]+\}|[{}]/g, '')
    .replace(/\\[a-z0-9]+ ?/g, ' ')
    .replace(/\\'[a-f0-9]{2}/g, '')
    .trim();
};

const parseInfo = (folderPath) => {
  if (!fs.existsSync(folderPath)) return { title: '', date: '', camera: '', lens: '', film: '', asa: '' };
  const files = fs.readdirSync(folderPath);
  const infoFile = files.find(f => f.endsWith('.rtf') || f.endsWith('.txt'));
  
  const info = {
    title: '',
    date: '',
    camera: '',
    lens: '',
    film: '',
    asa: ''
  };

  if (infoFile) {
    const content = fs.readFileSync(path.join(folderPath, infoFile), 'utf8');
    const text = infoFile.endsWith('.rtf') ? cleanRTF(content) : content;
    
    let currentKey = null;

    text.split('\n').forEach(line => {
      const parts = line.split('-');
      const potentialKey = parts[0].trim().toLowerCase();
      const isKnownKey = ['title', 'date', 'camera', 'lens', 'film', 'asa'].some(k => potentialKey.includes(k));

      if (parts.length > 1 && isKnownKey) {
        const value = parts.slice(1).join('-').trim();
        
        if (potentialKey.includes('title')) { info.title = value; currentKey = 'title'; }
        else if (potentialKey.includes('date')) { info.date = value; currentKey = 'date'; }
        else if (potentialKey.includes('camera')) { info.camera = value; currentKey = 'camera'; }
        else if (potentialKey.includes('lens')) { info.lens = value; currentKey = 'lens'; }
        else if (potentialKey.includes('film')) { info.film = value; currentKey = 'film'; }
        else if (potentialKey.includes('asa')) { info.asa = value; currentKey = 'asa'; }
      } else if (currentKey && line.trim()) {
        info[currentKey] = (info[currentKey] + ' ' + line.trim()).trim();
      }
    });

    Object.keys(info).forEach(key => {
      info[key] = cleanValue(info[key]);
    });
  }
  return info;
};

// Ingest any raw images or folders dropped directly into public/photos
const ingestFromPublic = () => {
  if (!fs.existsSync(PUBLIC_PHOTOS_DIR)) return;
  const entries = fs.readdirSync(PUBLIC_PHOTOS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const pubFolder = path.join(PUBLIC_PHOTOS_DIR, entry.name);
      const files = fs.readdirSync(pubFolder);
      const rawFiles = files.filter(f => /\.(jpe?g|png)$/i.test(f));
      
      // Only ingest if raw files exist
      if (rawFiles.length > 0) {
        const srcFolder = path.join(SOURCE_DIR, entry.name);
        if (!fs.existsSync(srcFolder)) fs.mkdirSync(srcFolder, { recursive: true });

        for (const file of files) {
          const srcFilePath = path.join(srcFolder, file);
          const pubFilePath = path.join(pubFolder, file);
          if (!fs.existsSync(srcFilePath)) {
            fs.copyFileSync(pubFilePath, srcFilePath);
          }
        }
      }
    }
  }
};

// Optimizes a single image to WebP with caching based on mtime
const optimizeImage = async (srcPath, destPath) => {
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  if (path.resolve(srcPath) !== path.resolve(destPath)) {
    const srcStat = fs.statSync(srcPath);
    const destExists = fs.existsSync(destPath);

    if (!destExists || fs.statSync(destPath).mtimeMs < srcStat.mtimeMs) {
      await sharp(srcPath)
        .rotate()
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(destPath);
    }
  }

  const meta = await sharp(destPath).metadata();
  return {
    width: meta.width || 0,
    height: meta.height || 0,
    orientation: (meta.width && meta.height && meta.width > meta.height) ? 'landscape' : 'portrait'
  };
};

// Optimize static folders (Cameras, Homepage Photos, About Me)
const optimizeStaticAssets = async () => {
  const staticFolders = [
    { src: path.join(SOURCE_DIR, '0 - Cameras'), dest: path.join(PUBLIC_PHOTOS_DIR, '0 - Cameras') },
    { src: path.join(SOURCE_DIR, '0 - Homepage Photos'), dest: path.join(PUBLIC_PHOTOS_DIR, '0 - Homepage Photos') },
    { src: path.join(SOURCE_DIR, 'about_me'), dest: PUBLIC_ABOUT_DIR }
  ];

  for (const { src, dest } of staticFolders) {
    if (!fs.existsSync(src)) continue;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const files = fs.readdirSync(src).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
    for (const file of files) {
      const srcFile = path.join(src, file);
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const destWebpFile = path.join(dest, `${baseName}.webp`);

      await optimizeImage(srcFile, destWebpFile);

      if (ext.toLowerCase() !== '.webp') {
        const rawInPub = path.join(dest, file);
        if (fs.existsSync(rawInPub)) fs.unlinkSync(rawInPub);
      }
    }
  }
};

const processTrips = async () => {
  ingestFromPublic();
  await optimizeStaticAssets();

  const pubArchive = path.join(PUBLIC_PHOTOS_DIR, '0 - Archive');
  if (fs.existsSync(pubArchive)) {
    fs.rmSync(pubArchive, { recursive: true, force: true });
  }

  const hasSourcePhotos = fs.existsSync(SOURCE_DIR) && 
    fs.readdirSync(SOURCE_DIR).some(f => !f.startsWith('.') && fs.statSync(path.join(SOURCE_DIR, f)).isDirectory());

  const sourceBase = hasSourcePhotos ? SOURCE_DIR : PUBLIC_PHOTOS_DIR;
  const folders = fs.readdirSync(sourceBase, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('0 -'))
    .map(dirent => dirent.name);

  const items = [];

  for (const folderName of folders) {
    const srcFolder = path.join(sourceBase, folderName);
    const pubFolder = path.join(PUBLIC_PHOTOS_DIR, folderName);
    if (!fs.existsSync(pubFolder)) fs.mkdirSync(pubFolder, { recursive: true });

    const info = parseInfo(srcFolder);
    const id = folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const infoFiles = fs.readdirSync(srcFolder).filter(f => /\.(rtf|txt)$/i.test(f));
    for (const infoFile of infoFiles) {
      const destInfo = path.join(pubFolder, infoFile);
      if (!fs.existsSync(destInfo)) fs.copyFileSync(path.join(srcFolder, infoFile), destInfo);
    }

    const imageFiles = fs.readdirSync(srcFolder).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
    const photos = [];

    for (let index = 0; index < imageFiles.length; index++) {
      const file = imageFiles[index];
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const srcPhotoPath = path.join(srcFolder, file);
      const destWebpPath = path.join(pubFolder, `${baseName}.webp`);

      const { orientation } = await optimizeImage(srcPhotoPath, destWebpPath);

      if (ext.toLowerCase() !== '.webp') {
        const rawPubPhoto = path.join(pubFolder, file);
        if (fs.existsSync(rawPubPhoto)) fs.unlinkSync(rawPubPhoto);
      }

      const isFirst = baseName.toLowerCase().startsWith('first_');
      const cleanTitle = baseName.replace(/^first_/i, '');

      photos.push({
        id: index + 1,
        url: `/photos/${folderName}/${baseName}.webp`,
        title: cleanTitle,
        film: cleanValue(info.film) + (info.asa ? ` ${cleanValue(info.asa)}` : ''),
        camera: cleanValue(info.camera) + (info.lens ? ` (${cleanValue(info.lens)})` : ''),
        orientation: orientation,
        isFirst: isFirst
      });
    }

    const sortedPhotos = [...photos].sort((a, b) => {
      if (a.isFirst && !b.isFirst) return -1;
      if (!a.isFirst && b.isFirst) return 1;
      if (a.orientation === 'landscape' && b.orientation === 'portrait') return -1;
      if (a.orientation === 'portrait' && b.orientation === 'landscape') return 1;
      return 0;
    });

    let dateStr = info.date || folderName.split('-').pop().trim();
    dateStr = cleanValue(dateStr);
    const parseableDate = dateStr.replace(',', '').replace(/Summer|Fall|Winter|Spring/i, '').trim();
    const timestamp = new Date(parseableDate).getTime();

    const isAlbum = folderName.startsWith('Album -');
    const displayTitle = (info.title || folderName.split('-')[1]?.trim() || folderName).replace(/Album - |Trip - /g, '');

    items.push({
      id: id,
      title: displayTitle,
      date: dateStr,
      camera: info.camera,
      lens: info.lens,
      film: info.film,
      asa: info.asa,
      highlightUrl: sortedPhotos[0]?.url || '',
      photos: sortedPhotos,
      type: isAlbum ? 'album' : 'trip',
      _timestamp: isNaN(timestamp) ? 0 : timestamp
    });
  }

  if (items.length > 0) {
    items.sort((a, b) => b._timestamp - a._timestamp);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2));
    console.log(`Successfully generated ${items.length} items to WebP format.`);
  } else {
    console.log('No folders found to process, preserving existing trips.json.');
  }
};

processTrips().catch(err => {
  console.error('Error during trips processing:', err);
  process.exit(1);
});
