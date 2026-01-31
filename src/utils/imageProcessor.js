/**
 * 📸 ImageProcessor  –  HEIC-safe, EXIF-orientation-aware image pipeline.
 *
 * Usage:
 *   const processor = new ImageProcessor();
 *   const jpegFile  = await processor.processImage(rawFile);
 */
export class ImageProcessor {
  constructor(options = {}) {
    this.maxWidth  = options.maxWidth  || 1920;
    this.maxHeight = options.maxHeight || 1080;
    this.quality   = options.quality   || 0.85;
  }

  /* ───────────────────── public ───────────────────── */
  async processImage(file) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Arquivo não é uma imagem válida');
    }
    if (this.#isHEIC(file)) file = await this.#handleHEIC(file);

    const img         = await this.#loadImage(file);
    const orientation = await this.#getOrientation(file);
    const dims        = this.#calcDimensions(img.width, img.height);

    const canvas = document.createElement('canvas');
    canvas.width  = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext('2d');

    this.#applyOrientation(ctx, orientation, dims.width, dims.height);
    ctx.drawImage(img, 0, 0, dims.width, dims.height);

    const blob = await new Promise((res, rej) =>
      canvas.toBlob(b => (b ? res(b) : rej(new Error('toBlob falhou'))), 'image/jpeg', this.quality)
    );

    return new File([blob], this.#generateName(file.name), { type: 'image/jpeg' });
  }

  /* ───────────────────── private ──────────────────── */
  #isHEIC(f) {
    return /image\/hei[cf]/.test(f.type) || /\.hei[cf]$/i.test(f.name);
  }
  async #handleHEIC(f) { return f; } // Safari auto-converts

  #loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      const t   = setTimeout(() => { URL.revokeObjectURL(url); reject(new Error('Timeout')); }, 30000);
      img.onload  = () => { clearTimeout(t); URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { clearTimeout(t); URL.revokeObjectURL(url); reject(new Error('Erro ao carregar imagem')); };
      img.src = url;
    });
  }

  async #getOrientation(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const v = new DataView(e.target.result);
          if (v.getUint16(0, false) !== 0xFFD8) return resolve(1);
          let off = 2;
          while (off < v.byteLength) {
            if (v.getUint16(off + 2, false) <= 8) return resolve(1);
            const marker = v.getUint16(off, false);
            off += 2;
            if (marker === 0xFFE1) {
              const little   = v.getUint16(off + 8, false) === 0x4949;
              const tagOff   = off + v.getUint16(off, false);
              if (tagOff > v.byteLength) return resolve(1);
              const tags     = v.getUint16(tagOff, little);
              for (let i = 0; i < tags; i++) {
                const ti = tagOff + 2 + i * 12;
                if (ti + 12 > v.byteLength) break;
                if (v.getUint16(ti, little) === 0x0112)
                  return resolve(v.getUint16(ti + 8, little));
              }
            } else if ((marker & 0xFF00) !== 0xFF00) break;
            else off += v.getUint16(off, false);
          }
          resolve(1);
        } catch { resolve(1); }
      };
      reader.onerror = () => resolve(1);
      reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    });
  }

  #calcDimensions(w, h) {
    if (w <= this.maxWidth && h <= this.maxHeight) return { width: w, height: h };
    const r = Math.min(this.maxWidth / w, this.maxHeight / h);
    return { width: Math.round(w * r), height: Math.round(h * r) };
  }

  #applyOrientation(ctx, o, w, h) {
    const transforms = {
      2: [-1, 0, 0, 1, w, 0],
      3: [-1, 0, 0,-1, w, h],
      4: [ 1, 0, 0,-1, 0, h],
      5: [ 0, 1, 1, 0, 0, 0],
      6: [ 0, 1,-1, 0, h, 0],
      7: [ 0,-1,-1, 0, h, w],
      8: [ 0,-1, 1, 0, 0, w],
    };
    if (transforms[o]) ctx.transform(...transforms[o]);
  }

  #generateName(orig) {
    const safe = orig.replace(/\.[^/.]+$/, '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
    return `${safe}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  }
}

/* ─────────────────────────────────────────────────────
 * SupabaseUploader  –  validates → processes → uploads
 * ───────────────────────────────────────────────────── */
export class SupabaseUploader {
  constructor(supabaseClient) {
    this.supabase  = supabaseClient;
    this.bucket    = 'blog-images';
    this.processor = new ImageProcessor({ maxWidth: 1920, maxHeight: 1080, quality: 0.85 });
  }

  async uploadImage(file, onProgress = null) {
    this.#validateFile(file);

    onProgress?.({ stage: 'processing', percent: 10 });
    const processed = await this.processor.processImage(file);

    onProgress?.({ stage: 'uploading', percent: 50 });
    const { path, publicUrl } = await this.#uploadToStorage(processed);

    onProgress?.({ stage: 'complete', percent: 100 });
    return { success: true, url: publicUrl, path, size: processed.size, fileName: processed.name };
  }

  #validateFile(file) {
    if (!file) throw new Error('Nenhum arquivo selecionado');
    const ok = /image\/(jpe?g|png|webp|hei[cf])/.test(file.type) || /\.(jpe?g|png|webp|hei[cf])$/i.test(file.name);
    if (!ok)   throw new Error('Formato não suportado. Use: JPG, PNG, WEBP ou HEIC');
    if (file.size > 20 * 1024 * 1024) throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: 20MB`);
  }

  async #uploadToStorage(file) {
    let filePath = `posts/${file.name}`;
    let { data, error } = await this.supabase.storage.from(this.bucket).upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error?.message?.includes('already exists')) {
      filePath = `posts/${Date.now()}-${file.name}`;
      ({ data, error } = await this.supabase.storage.from(this.bucket).upload(filePath, file, { cacheControl: '3600', upsert: false }));
    }
    if (error) throw error;

    const { data: urlData } = this.supabase.storage.from(this.bucket).getPublicUrl(data.path);
    return { path: data.path, publicUrl: urlData.publicUrl };
  }
}
