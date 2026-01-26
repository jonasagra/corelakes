/**
 * 📸 Image Processor - VERSÃO CORRIGIDA
 * Resolve problemas de HEIC travando
 */

class ImageProcessor {
    constructor(options = {}) {
        this.maxWidth = options.maxWidth || 1920;
        this.maxHeight = options.maxHeight || 1080;
        this.quality = options.quality || 0.85;
        this.maxSizeMB = options.maxSizeMB || 2;
    }

    async processImage(file) {
        console.log('📸 Processando:', file.name, file.type, file.size);

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            throw new Error('Arquivo não é uma imagem válida');
        }

        // Se for HEIC, tentar criar um novo File como JPEG
        if (this.isHEIC(file)) {
            console.log('🔄 Detectado HEIC, preparando conversão...');
            file = await this.handleHEIC(file);
        }

        try {
            // Carregar imagem
            const img = await this.loadImage(file);
            console.log('✅ Imagem carregada:', img.width, 'x', img.height);

            // Obter orientação
            const orientation = await this.getOrientation(file);
            console.log('🧭 Orientação EXIF:', orientation);

            // Calcular dimensões
            const dimensions = this.calculateDimensions(img.width, img.height);
            console.log('📏 Novas dimensões:', dimensions);

            // Criar canvas
            const canvas = this.createCanvas(dimensions.width, dimensions.height);
            const ctx = canvas.getContext('2d');

            // Aplicar transformações de orientação
            this.applyOrientation(ctx, orientation, dimensions.width, dimensions.height);

            // Desenhar
            ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

            // Converter para blob
            const blob = await this.canvasToBlob(canvas);
            console.log('✅ Processado:', blob.size, 'bytes');

            // Criar File object
            return new File(
                [blob],
                this.generateFileName(file.name),
                { type: 'image/jpeg' }
            );

        } catch (error) {
            console.error('❌ Erro ao processar:', error);
            throw new Error('Erro ao processar imagem: ' + error.message);
        }
    }

    isHEIC(file) {
        return file.type === 'image/heic' || 
               file.type === 'image/heif' || 
               file.name.toLowerCase().endsWith('.heic') ||
               file.name.toLowerCase().endsWith('.heif');
    }

    async handleHEIC(file) {
        console.log('⚠️ HEIC detectado - navegador tentará converter automaticamente');
        // O Safari/iOS já converte HEIC automaticamente ao usar FileReader
        // Apenas retornar o arquivo, o loadImage vai lidar
        return file;
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            const timeout = setTimeout(() => {
                URL.revokeObjectURL(url);
                reject(new Error('Timeout ao carregar imagem (30s)'));
            }, 30000); // 30 segundos timeout

            img.onload = () => {
                clearTimeout(timeout);
                URL.revokeObjectURL(url);
                resolve(img);
            };

            img.onerror = (e) => {
                clearTimeout(timeout);
                URL.revokeObjectURL(url);
                console.error('Erro ao carregar imagem:', e);
                reject(new Error('Erro ao carregar imagem. Tente outra foto.'));
            };

            img.src = url;
        });
    }

    async getOrientation(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const view = new DataView(e.target.result);
                    
                    if (view.getUint16(0, false) !== 0xFFD8) {
                        resolve(1);
                        return;
                    }

                    const length = view.byteLength;
                    let offset = 2;

                    while (offset < length) {
                        if (view.getUint16(offset + 2, false) <= 8) {
                            resolve(1);
                            return;
                        }

                        const marker = view.getUint16(offset, false);
                        offset += 2;

                        if (marker === 0xFFE1) {
                            const little = view.getUint16(offset + 8, false) === 0x4949;
                            const tagOffset = offset + view.getUint16(offset, false);
                            
                            if (tagOffset > length) {
                                resolve(1);
                                return;
                            }

                            const tags = view.getUint16(tagOffset, little);
                            
                            for (let i = 0; i < tags; i++) {
                                const tagIndex = tagOffset + 2 + (i * 12);
                                if (tagIndex + 12 > length) break;
                                
                                if (view.getUint16(tagIndex, little) === 0x0112) {
                                    const orientation = view.getUint16(tagIndex + 8, little);
                                    resolve(orientation);
                                    return;
                                }
                            }
                        } else if ((marker & 0xFF00) !== 0xFF00) {
                            break;
                        } else {
                            offset += view.getUint16(offset, false);
                        }
                    }

                    resolve(1);
                } catch (err) {
                    console.warn('Erro ao ler EXIF:', err);
                    resolve(1);
                }
            };

            reader.onerror = () => resolve(1);
            
            // Ler apenas os primeiros 64KB para performance
            reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
        });
    }

    calculateDimensions(width, height) {
        let newWidth = width;
        let newHeight = height;

        if (width > this.maxWidth || height > this.maxHeight) {
            const ratio = Math.min(this.maxWidth / width, this.maxHeight / height);
            newWidth = Math.round(width * ratio);
            newHeight = Math.round(height * ratio);
        }

        return { width: newWidth, height: newHeight };
    }

    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    applyOrientation(ctx, orientation, width, height) {
        switch (orientation) {
            case 2:
                ctx.transform(-1, 0, 0, 1, width, 0);
                break;
            case 3:
                ctx.transform(-1, 0, 0, -1, width, height);
                break;
            case 4:
                ctx.transform(1, 0, 0, -1, 0, height);
                break;
            case 5:
                ctx.transform(0, 1, 1, 0, 0, 0);
                break;
            case 6:
                ctx.transform(0, 1, -1, 0, height, 0);
                break;
            case 7:
                ctx.transform(0, -1, -1, 0, height, width);
                break;
            case 8:
                ctx.transform(0, -1, 1, 0, 0, width);
                break;
        }
    }

    canvasToBlob(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Erro ao criar blob da imagem'));
                    }
                },
                'image/jpeg',
                this.quality
            );
        });
    }

    generateFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        
        const safeName = originalName
            .replace(/\.[^/.]+$/, '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 30);

        return `${safeName}-${timestamp}-${random}.jpg`;
    }
}

window.ImageProcessor = ImageProcessor;