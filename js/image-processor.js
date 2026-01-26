class ImageProcessor {
    constructor(options = {}) {
        this.maxWidth = options.maxWidth || 1920;
        this.maxHeight = options.maxHeight || 1080;
        this.quality = options.quality || 0.85;
        this.maxSizeMB = options.maxSizeMB || 2;
    }

    /**
     * Processa arquivo de imagem (principal)
     */
    async processImage(file) {
        console.log('📸 Processando imagem:', file.name, file.type, file.size);

        // Validar se é imagem
        if (!file.type.startsWith('image/')) {
            throw new Error('Arquivo não é uma imagem válida');
        }

        // Converter HEIC para JPEG se necessário
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
            console.log('🔄 Convertendo HEIC para JPEG...');
            file = await this.convertHEICtoJPEG(file);
        }

        // Ler arquivo como imagem
        const img = await this.loadImage(file);
        
        // Obter orientação EXIF
        const orientation = await this.getOrientation(file);
        console.log('🧭 Orientação EXIF:', orientation);

        // Calcular dimensões mantendo proporção
        const dimensions = this.calculateDimensions(img.width, img.height);
        console.log('📏 Dimensões:', dimensions);

        // Criar canvas e desenhar com correção de orientação
        const canvas = this.createCanvas(dimensions.width, dimensions.height);
        const ctx = canvas.getContext('2d');

        // Aplicar correção de orientação
        this.applyOrientation(ctx, orientation, dimensions.width, dimensions.height);

        // Desenhar imagem
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

        // Converter para blob otimizado
        const blob = await this.canvasToBlob(canvas);
        console.log('✅ Imagem processada:', blob.size, 'bytes');

        // Criar novo File object
        const processedFile = new File(
            [blob], 
            this.generateFileName(file.name),
            { type: 'image/jpeg' }
        );

        return processedFile;
    }

    /**
     * Converte HEIC para JPEG (solução para iPhone)
     */
    async convertHEICtoJPEG(file) {
        try {
            // Tentar converter usando heic2any (precisa adicionar biblioteca)
            // Por enquanto, vamos apenas renomear e processar como JPEG
            // O navegador Safari já converte automaticamente
            return new File([file], file.name.replace(/\.heic$/i, '.jpg'), {
                type: 'image/jpeg'
            });
        } catch (error) {
            console.warn('⚠️ Erro ao converter HEIC:', error);
            return file;
        }
    }

    /**
     * Carrega imagem como HTMLImageElement
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Erro ao carregar imagem'));
            };

            img.src = url;
        });
    }

    /**
     * Obtém orientação EXIF da imagem
     */
    async getOrientation(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const view = new DataView(e.target.result);
                
                if (view.getUint16(0, false) !== 0xFFD8) {
                    resolve(1); // Não é JPEG
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
                        offset += view.getUint16(offset, false);
                        
                        const tags = view.getUint16(offset, little);
                        offset += 2;

                        for (let i = 0; i < tags; i++) {
                            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                                const orientation = view.getUint16(offset + (i * 12) + 8, little);
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

                resolve(1); // Orientação padrão
            };

            reader.onerror = () => resolve(1);
            reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
        });
    }

    /**
     * Calcula dimensões mantendo proporção
     */
    calculateDimensions(width, height) {
        let newWidth = width;
        let newHeight = height;

        // Redimensionar se exceder máximo
        if (width > this.maxWidth || height > this.maxHeight) {
            const ratio = Math.min(this.maxWidth / width, this.maxHeight / height);
            newWidth = Math.round(width * ratio);
            newHeight = Math.round(height * ratio);
        }

        return { width: newWidth, height: newHeight };
    }

    /**
     * Cria canvas com dimensões especificadas
     */
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    /**
     * Aplica correção de orientação EXIF
     */
    applyOrientation(ctx, orientation, width, height) {
        switch (orientation) {
            case 2:
                // Flip horizontal
                ctx.transform(-1, 0, 0, 1, width, 0);
                break;
            case 3:
                // Rotação 180°
                ctx.transform(-1, 0, 0, -1, width, height);
                break;
            case 4:
                // Flip vertical
                ctx.transform(1, 0, 0, -1, 0, height);
                break;
            case 5:
                // Rotação 90° + flip horizontal
                ctx.transform(0, 1, 1, 0, 0, 0);
                break;
            case 6:
                // Rotação 90° horário
                ctx.transform(0, 1, -1, 0, height, 0);
                break;
            case 7:
                // Rotação 90° anti-horário + flip horizontal
                ctx.transform(0, -1, -1, 0, height, width);
                break;
            case 8:
                // Rotação 90° anti-horário
                ctx.transform(0, -1, 1, 0, 0, width);
                break;
            default:
                // Orientação normal (1)
                break;
        }
    }

    /**
     * Converte canvas para blob comprimido
     */
    canvasToBlob(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Erro ao criar blob'));
                    }
                },
                'image/jpeg',
                this.quality
            );
        });
    }

    /**
     * Gera nome de arquivo seguro
     */
    generateFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = '.jpg';
        
        // Criar nome seguro
        const safeName = originalName
            .replace(/\.[^/.]+$/, '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 30);

        return `${safeName}-${timestamp}-${random}${ext}`;
    }

    /**
     * Valida tamanho do arquivo
     */
    validateSize(file) {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > this.maxSizeMB * 5) { // Permitir 5x antes de processar
            throw new Error(`Imagem muito grande (${sizeMB.toFixed(1)}MB). Máximo permitido: ${this.maxSizeMB * 5}MB`);
        }
        return true;
    }
}

// Export para uso nos HTMLs
window.ImageProcessor = ImageProcessor;