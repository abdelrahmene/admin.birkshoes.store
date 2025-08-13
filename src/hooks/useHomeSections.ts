'use client'

import { useState, useEffect } from 'react'

interface HomeSection {
  id: string
  title: string
  description?: string
  type: string
  content: string
  isVisible: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export const useHomeSections = () => {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSections = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/content/home-sections')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des sections')
      }

      setSections(data.data || [])
    } catch (err) {
      console.error('Erreur:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setSections([])
    } finally {
      setLoading(false)
    }
  }

  const createSection = async (data: Partial<HomeSection>) => {
    try {
      const response = await fetch('/api/content/home-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      
      await fetchSections()
    } catch (err) {
      throw err
    }
  }

  const updateSection = async (id: string, data: Partial<HomeSection>) => {
    try {
      const response = await fetch(`/api/content/home-sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      
      await fetchSections()
    } catch (err) {
      throw err
    }
  }

  const deleteSection = async (id: string) => {
    try {
      const response = await fetch(`/api/content/home-sections/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      
      await fetchSections()
    } catch (err) {
      throw err
    }
  }

  const updateOrder = async (orderedSections: { id: string }[]) => {
    try {
      const response = await fetch('/api/content/home-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: orderedSections }),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      
      await fetchSections()
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  return {
    sections,
    loading,
    error,
    createSection,
    updateSection,
    deleteSection,
    updateOrder,
    refresh: fetchSections,
  }
}
