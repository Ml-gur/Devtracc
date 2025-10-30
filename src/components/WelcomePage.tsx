import React from 'react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WelcomePageProps {
  onNavigate: (page: 'register' | 'login') => void;
}

export default function WelcomePage({ onNavigate }: WelcomePageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">DT</span>
          </div>
          <span className="text-xl font-bold">DevTrack</span>
        </div>
        <div className="hidden sm:flex space-x-4">
          <Button variant="ghost" onClick={() => onNavigate('login')}>
            Login
          </Button>
          <Button onClick={() => onNavigate('register')}>
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 py-12 lg:py-20">
        <div className="flex-1 max-w-2xl text-center lg:text-left lg:pr-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Showcase Your{' '}
            <span className="text-primary">Development Journey</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Track projects, share progress, and build your developer reputation in the African tech community. 
            Connect with fellow developers and showcase your coding journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              onClick={() => onNavigate('register')}
              className="text-lg px-8 py-3"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => onNavigate('login')}
              className="text-lg px-8 py-3"
            >
              Login
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-center lg:text-left">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Track Projects</h3>
              <p className="text-sm text-muted-foreground">Organize and monitor your development projects with built-in task management.</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Share Progress</h3>
              <p className="text-sm text-muted-foreground">Post updates and showcase your development journey to the community.</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Build Reputation</h3>
              <p className="text-sm text-muted-foreground">Establish your developer profile and connect with the African tech community.</p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex-1 max-w-lg mt-12 lg:mt-0">
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80"
                alt="Developer working on a project"
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-card border rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">5 projects active</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-card border rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">💻 React • Python • Node.js</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile CTA */}
      <div className="sm:hidden px-4 pb-6">
        <div className="flex flex-col gap-3">
          <Button 
            size="lg" 
            onClick={() => onNavigate('register')}
            className="w-full"
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => onNavigate('login')}
            className="w-full"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}