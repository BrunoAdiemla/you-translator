// Cache service para armazenar dados temporariamente no localStorage
// com suporte a expiração

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // em milissegundos
}

export const cacheService = {
  /**
   * Armazena dados no cache com tempo de expiração
   * @param key - Chave única para identificar o cache
   * @param data - Dados a serem armazenados
   * @param expiresIn - Tempo de expiração em milissegundos (padrão: 10 minutos)
   */
  set<T>(key: string, data: T, expiresIn: number = 10 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };
    
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  /**
   * Recupera dados do cache se ainda não expiraram
   * @param key - Chave do cache
   * @returns Dados armazenados ou null se expirado/não encontrado
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();
      const age = now - entry.timestamp;

      // Verificar se o cache expirou
      if (age > entry.expiresIn) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },

  /**
   * Remove um item específico do cache
   * @param key - Chave do cache a ser removido
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  },

  /**
   * Limpa todo o cache (remove todos os itens que começam com 'cache_')
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  /**
   * Verifica se um cache existe e ainda é válido
   * @param key - Chave do cache
   * @returns true se o cache existe e é válido
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  },
};
