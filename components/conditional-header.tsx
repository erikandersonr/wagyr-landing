"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"

const AUTH_PATHS = ["/sign-in", "/sign-up"]

export function ConditionalHeader() {
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p))
  if (isAuthPage) return null
  return <SiteHeader />
}
