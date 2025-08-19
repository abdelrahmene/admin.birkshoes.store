'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from './LoginForm'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  // Afficher le loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Si pas authentifié, afficher le login
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    )
  }

  // Vérifier le rôle admin
  if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette zone.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // Si authentifié et admin, afficher le contenu
  return <>{children}</>
}
