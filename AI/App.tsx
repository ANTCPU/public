import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Mission } from './components/Mission';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Hero />
        <Services />
        <Mission />
      </main>
      <Footer />
    </div>
  );
};

export default App;