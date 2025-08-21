'use client'

import { useRouter } from 'next/navigation'

export default function NewSectionPage() {
  const router = useRouter()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Nouvelle Section</h1>
      <p>Cette page est en développement.</p>
      <button 
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retour
      </button>
    </div>
  )
}
