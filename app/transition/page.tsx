"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function TransitionPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/get-started")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="fixed inset-0 w-screen h-screen z-[99999]">
      <Image src="/images/butterfly.jpg" alt="Transition" fill className="object-cover" priority />
    </div>
  )
}
