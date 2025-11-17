'use client'

import { useState, useEffect } from 'react'

interface TypewriterTextProps {
  text: string
  delay?: number
  speed?: number
}

/**
 * TypewriterText Component (CURRENTLY USED IN IGRAONICA DESCRIPTION)
 *
 * Classic typewriter effect - adds one character at a time
 * - useState: Manages displayed text, current index, and start state
 * - useEffect #1: Delays start of typing by 'delay' seconds
 * - useEffect #2: Adds characters one by one based on 'speed' (ms per char)
 * - speed=30: 30ms between characters (faster = lower number)
 * - Returns plain span with progressively revealed text
 *
 * @param text - The text content to animate
 * @param delay - Animation delay in seconds (default: 0)
 * @param speed - Milliseconds between each character (default: 30)
 */
export const TypewriterText = ({ text, delay = 0, speed = 30 }: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true)
    }, delay * 1000)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!hasStarted) return

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, hasStarted, text, speed])

  return <span>{displayedText}</span>
}
