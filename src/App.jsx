import React from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Hero } from './components/Hero'
import { AppPreview } from './components/AppPreview'
import { WaitlistCard } from './components/WaitlistCard'
import { AnimatedSection } from './components/AnimatedSection'
import { TopNav } from './components/TopNav'
import { Features } from './components/Features'
import { Partnerships } from './components/Partnerships'
import { InteractiveBackground } from './components/InteractiveBackground'
import './index.css'

function App() {
  return (
    <div className="app-wrapper">
      <InteractiveBackground />
      <TopNav />
      
      <main className="container">
        <AnimatedSection delay={0.1}>
          <Hero />
        </AnimatedSection>
        
        <AnimatedSection delay={0.3}>
          <AppPreview />
        </AnimatedSection>

        <AnimatedSection delay={0.5}>
          <Features />
        </AnimatedSection>

        <AnimatedSection delay={0.7}>
          <div style={{ paddingBottom: '60px' }}>
            <WaitlistCard />
          </div>
        </AnimatedSection>
        
        <AnimatedSection delay={0.9}>
          <Partnerships />
        </AnimatedSection>
      </main>

      <Analytics />
    </div>
  )
}

export default App
