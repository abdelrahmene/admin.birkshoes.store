'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiClient, User, LoginData } from '@/services/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginData) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier l'authentification au chargement
  const checkAuth = async () => {
    try {
      setIsLoading(true)
      
      if (!apiClient.getToken()) {
        setUser(null)
        return
      }

      // Vérifier si le token est valide
      const userData = await apiClient.verifyToken()
      setUser(userData)
      
    } catch (error) {
      console.error('Erreur lors de la vérification auth:', error)
      setUser(null)
      apiClient.setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Connexion
  const login = async (credentials: LoginData): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await apiClient.login(credentials)
      
      if (response.token && response.user) {
        setUser(response.user)
        toast.success(`Bienvenue ${response.user.name || response.user.email}!`)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      toast.error('Identifiants invalides')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Déconnexion
  const logout = () => {
    setUser(null)
    apiClient.logout()
    toast.success('Vous êtes déconnecté')
  }

  // Vérifier l'auth au montage du composant
  useEffect(() => {
    checkAuth()
  }, [])

  const isAuthenticated = !!user && !!apiClient.getToken()

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
