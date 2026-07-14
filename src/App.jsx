import React, { useState, lazy, Suspense } from 'react'
import { LazyMotion } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { TopNav } from './components/TopNav'
import { Hero } from './components/Hero'
import {
  Concept, Games, ChatDemo, Plans, FinalCta,
} from './components/Sections'
import { KiroPlaces } from './components/KiroPlaces'
import { Footer } from './components/Footer'
import './index.css'

/* Le moteur d'animation complet (drag du téléphone…) est chargé en
   asynchrone après le premier rendu : bundle initial plus léger */
const loadMotionFeatures = () => import('./motion-features').then((m) => m.default)

/* Les fenêtres modales ne sont téléchargées qu'à la première ouverture */
const Modals = lazy(() => import('./components/Modals').then((m) => ({ default: m.Modals })))

function App() {
  const [modal, setModal] = useState(null) // 'test' | 'beta' | 'lang' | null
  const [modalsLoaded, setModalsLoaded] = useState(false)
  const open = (name) => {
    setModalsLoaded(true)
    setModal(name)
  }
  const close = () => setModal(null)

  return (
    <LazyMotion features={loadMotionFeatures} strict>
    <div className="app-wrapper">
      <TopNav onOpenLang={() => open('lang')} />

      <main>
        <Hero onOpenTest={() => open('test')} onOpenBeta={() => open('beta')} />
        <Concept />
        <Games />
        <ChatDemo />
        <KiroPlaces />
        <Plans />
        <FinalCta onOpenTest={() => open('test')} onOpenBeta={() => open('beta')} />
      </main>

      <Footer />

      {modalsLoaded && (
        <Suspense fallback={null}>
          <Modals active={modal} onClose={close} />
        </Suspense>
      )}
      <Analytics />
    </div>
    </LazyMotion>
  )
}

export default App
