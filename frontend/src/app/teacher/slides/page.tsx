'use client';

import React, { useState, useEffect } from 'react';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Presentation, Play, Plus, Trash2, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  content: string;
  bullets: string[];
}

export default function TeacherSlidesPage() {
  const [deckTitle, setDeckTitle] = useState('Lecture 1: Distributed Systems Fundamentals');
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 'slide-1',
      title: 'Introduction to Distributed Consensus',
      content: 'Core principles of fault tolerance, replication, and state machine consistency in modern distributed databases.',
      bullets: ['CAP Theorem tradeoffs', 'Leader election vs Leaderless', 'Raft and Paxos mechanisms'],
    },
    {
      id: 'slide-2',
      title: 'The CAP Theorem in Practice',
      content: 'Guarantees and real-world compromises in modern cloud-native architectures.',
      bullets: ['Consistency (Linearizability)', 'Availability under network partitions', 'PACELC extensions'],
    },
  ]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenterMode, setIsPresenterMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresenterMode) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsPresenterMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenterMode, slides.length]);

  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: 'New Slide Title',
      content: 'Add explanatory concept details here...',
      bullets: ['Key takeaway point 1', 'Key takeaway point 2'],
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const updateCurrentSlide = (field: keyof Slide, value: any) => {
    const updated = [...slides];
    updated[currentSlideIndex] = { ...updated[currentSlideIndex], [field]: value };
    setSlides(updated);
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <TeacherLayout>
      {/* Full-Screen In-Browser Presenter Mode */}
      {isPresenterMode ? (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-8 sm:p-16 select-none animate-in fade-in">
          {/* Presenter Top Bar */}
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">{deckTitle}</span>
            <div className="flex items-center gap-4">
              <span>
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
              <button
                onClick={() => setIsPresenterMode(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide Content */}
          <div className="max-w-4xl mx-auto space-y-8 my-auto text-center sm:text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {currentSlide.title}
            </h1>
            <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-3xl">
              {currentSlide.content}
            </p>

            <ul className="space-y-4 pt-4 text-left max-w-2xl">
              {currentSlide.bullets?.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 mt-2.5 flex-shrink-0"></span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Presenter Controls Footer */}
          <div className="flex items-center justify-between text-slate-500 text-xs pt-6 border-t border-slate-900">
            <span>Use Arrow Keys or Space to navigate &bull; Press Esc to exit</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-slate-900 text-white border-slate-800 hover:bg-slate-800"
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Slide Studio Editor */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Slide Deck Studio</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Author lecture materials directly in CampusOS and launch in-browser presentation mode.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={addSlide}>
                <Plus className="w-4 h-4 mr-1" /> Add Slide
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => setIsPresenterMode(true)}>
                <Play className="w-4 h-4 mr-1.5" /> Present Deck
              </Button>
            </div>
          </div>

          {/* Studio Layout: Left Thumbnails, Right Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Slide Thumbnails Column */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Slides ({slides.length})
              </span>
              <div className="space-y-2.5">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-full p-4 rounded-xl text-left border transition-all ${
                      currentSlideIndex === idx
                        ? 'bg-indigo-50/90 border-indigo-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Slide {idx + 1}</span>
                      {currentSlideIndex === idx && <Badge variant="primary">Active</Badge>}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{s.title}</h4>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Editor Column */}
            <div className="lg:col-span-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Editing Slide {currentSlideIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <Input
                    label="Slide Title"
                    value={currentSlide.title}
                    onChange={(e) => updateCurrentSlide('title', e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Slide Body / Core Concept
                    </label>
                    <textarea
                      rows={4}
                      value={currentSlide.content}
                      onChange={(e) => updateCurrentSlide('content', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Bullet Points (one per line)
                    </label>
                    <textarea
                      rows={4}
                      value={currentSlide.bullets?.join('\n') || ''}
                      onChange={(e) => updateCurrentSlide('bullets', e.target.value.split('\n'))}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
