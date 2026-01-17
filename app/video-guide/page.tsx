"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"

export default function VideoGuidePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showPlayButton, setShowPlayButton] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [hasWatchedBefore, setHasWatchedBefore] = useState(true)
  const [startVideo, setStartVideo] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem("video-guide-visited")
    if (!hasVisited) {
      setShowWelcomeModal(true)
      setHasWatchedBefore(false)
    } else {
      setStartVideo(true)
    }
  }, [])

  const handleStartVideo = () => {
    setShowWelcomeModal(false)
    localStorage.setItem("video-guide-visited", "true")
    setStartVideo(true)
  }

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setShowPlayButton(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-black">
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Welcome!</h2>
            <p className="text-gray-700 mb-6 text-lg">
              Before you continue, please watch this important introductory video about our Home Business Wealth and
              Lifestyle Optimiser services.
            </p>
            <button
              onClick={handleStartVideo}
              className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors text-lg font-semibold w-full"
            >
              Watch Video Now
            </button>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold text-white">
              DYH Explore
            </Link>
            <div className="flex items-center gap-8">
              <Link
                href="/video-guide"
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
              >
                Video Guide
              </Link>
              <Link
                href="/demo/scenarios"
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
              >
                Demo Scenarios
              </Link>
              <Link
                href="/get-started"
                className="bg-white text-black px-4 py-2 rounded-md hover:bg-white/90 transition-colors text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-white mb-4">Video Guide</h1>
          <p className="text-white/70 mb-8">
            Watch our introductory video to learn about our Home Business Wealth and Lifestyle Optimiser services.
          </p>

          <div className="bg-black rounded-lg overflow-hidden border border-white/10 relative aspect-video">
            {startVideo && (
              <video ref={videoRef} className="w-full h-full" controls playsInline autoPlay={hasWatchedBefore}>
                <source
                  src="https://res.cloudinary.com/dpehjgfrt/video/upload/f_auto,q_auto/DYH_Explore_compressed_to_17_vbthrq.mp4"
                  type="video/mp4"
                />
              </video>
            )}
            {(!startVideo || showPlayButton) && (
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer"
                onClick={handlePlay}
              >
                <div className="bg-white/90 rounded-full p-6 hover:bg-white transition-colors">
                  <Play className="w-12 h-12 text-black" fill="currentColor" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
