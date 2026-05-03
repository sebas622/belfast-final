'use client'
import dynamic from 'next/dynamic'

const AppInterna = dynamic(() => import('./AppInterna.jsx'), { 
    ssr: false,
    loading: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A' }}>
            <div style={{ color: '#fff', fontSize: 14 }}>Cargando...</div>
        </div>
    )
})

export default function Page() {
    return <AppInterna />
}
