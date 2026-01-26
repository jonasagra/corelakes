class SupabaseUploader {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.bucket = 'blog-images';
        this.processor = new ImageProcessor({
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
            maxSizeMB: 2
        });
    }

    /**
     * Upload de imagem completo (processa + envia)
     */
    async uploadImage(file, onProgress = null) {
        try {
            console.log('🚀 Iniciando upload:', file.name);

            // 1. Validar arquivo
            this.validateFile(file);

            // 2. Processar imagem (corrige iPhone, EXIF, redimensiona)
            if (onProgress) onProgress({ stage: 'processing', percent: 10 });
            const processedFile = await this.processor.processImage(file);

            // 3. Fazer upload para Supabase
            if (onProgress) onProgress({ stage: 'uploading', percent: 50 });
            const { path, publicUrl } = await this.uploadToStorage(processedFile);

            if (onProgress) onProgress({ stage: 'complete', percent: 100 });

            console.log('✅ Upload completo:', publicUrl);

            return {
                success: true,
                url: publicUrl,
                path: path,
                size: processedFile.size,
                fileName: processedFile.name
            };

        } catch (error) {
            console.error('❌ Erro no upload:', error);
            throw error;
        }
    }

    /**
     * Valida arquivo antes do upload
     */
    validateFile(file) {
        // Verificar se é arquivo
        if (!file) {
            throw new Error('Nenhum arquivo selecionado');
        }

        // Verificar tipo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
        const isValidType = validTypes.includes(file.type) || 
                           file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/);

        if (!isValidType) {
            throw new Error('Formato não suportado. Use: JPG, PNG, WEBP ou HEIC');
        }

        // Verificar tamanho (máximo 20MB antes de processar)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: 20MB`);
        }

        return true;
    }

    /**
     * Faz upload para Supabase Storage
     */
    async uploadToStorage(file) {
        const filePath = `posts/${file.name}`;

        const { data, error } = await this.supabase.storage
            .from(this.bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            // Se arquivo já existe, tentar com timestamp
            if (error.message.includes('already exists')) {
                const timestamp = Date.now();
                const newPath = `posts/${timestamp}-${file.name}`;
                
                const retry = await this.supabase.storage
                    .from(this.bucket)
                    .upload(newPath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (retry.error) throw retry.error;
                
                const publicUrl = this.getPublicUrl(retry.data.path);
                return { path: retry.data.path, publicUrl };
            }
            
            throw error;
        }

        const publicUrl = this.getPublicUrl(data.path);
        return { path: data.path, publicUrl };
    }

    /**
     * Obtém URL pública do arquivo
     */
    getPublicUrl(path) {
        const { data } = this.supabase.storage
            .from(this.bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    /**
     * Deleta imagem do storage
     */
    async deleteImage(path) {
        if (!path) return;

        try {
            const { error } = await this.supabase.storage
                .from(this.bucket)
                .remove([path]);

            if (error) throw error;

            console.log('🗑️ Imagem deletada:', path);
            return true;

        } catch (error) {
            console.error('Erro ao deletar imagem:', error);
            return false;
        }
    }

    /**
     * Lista todas as imagens do usuário
     */
    async listImages(folder = 'posts') {
        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucket)
                .list(folder, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) throw error;

            return data.map(file => ({
                name: file.name,
                path: `${folder}/${file.name}`,
                url: this.getPublicUrl(`${folder}/${file.name}`),
                size: file.metadata?.size || 0,
                createdAt: file.created_at
            }));

        } catch (error) {
            console.error('Erro ao listar imagens:', error);
            return [];
        }
    }
}

// Export para uso nos HTMLs
window.SupabaseUploader = SupabaseUploader;