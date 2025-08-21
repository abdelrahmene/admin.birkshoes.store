// Enhanced API client with JWT authentication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

interface LoginData {
  email: string
  password: string
}

interface User {
  id: string
  email: string
  name?: string
  role: string
}

interface AuthResponse {
  token: string
  user: User
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Récupérer le token du localStorage au démarrage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  // Définir le token d'authentification
  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  // Récupérer le token actuel
  getToken(): string | null {
    return this.token
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.token
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Ajouter le token JWT si disponible
    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      }
    }

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`)
      if (this.token) {
        console.log('🔑 Token présent dans la requête')
      }

      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Si 401 Unauthorized, déconnecter l'utilisateur
        if (response.status === 401) {
          console.log('🚫 Token invalide ou expiré, déconnexion...')
          this.setToken(null)
          // Recharger la page pour déclencher AuthGuard
          if (typeof window !== 'undefined') {
          window.location.reload()
          }
        }
        
        const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }))
        console.error(`❌ API Request failed: ${endpoint}`, `Error: API Error: ${response.status} ${response.statusText}`)
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ API Response: ${endpoint}`, data)
      return data
    } catch (error) {
      console.error(`❌ API Request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Méthodes HTTP standard
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Méthodes d'authentification
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    // Stocker le token après une connexion réussie
    if (response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async logout(): Promise<void> {
    this.setToken(null)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  // Vérifier si le token est valide
  async verifyToken(): Promise<User | null> {
    if (!this.token) return null

    try {
      // Faire une requête à la route de vérification
      const response = await this.get('/auth/me')
      return response.user || null
    } catch (error) {
      console.error('Token invalide:', error)
      this.setToken(null)
      return null
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Services for content management
export const getContent = async (sectionId: string) => {
  return apiClient.get(`/content/home-section/${sectionId}`)
}

export const saveContent = async (sectionId: string, data: any) => {
  return apiClient.put(`/content/home-sections/${sectionId}`, data)
}

// Collection items services
export const getCollectionItems = async (sectionId: string) => {
  return apiClient.get(`/content/home-section/${sectionId}/collections`)
}

export const saveCollectionItems = async (sectionId: string, items: any[], carouselConfig: any) => {
  return apiClient.put(`/content/home-section/${sectionId}/collections`, {
    items,
    carouselConfig
  })
}

// Media services
export const getMediaFiles = async () => {
  return apiClient.get('/content/media')
}

// Export des types pour utilisation dans d'autres composants
export type { User, AuthResponse, LoginData }
