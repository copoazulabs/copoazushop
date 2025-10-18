'use client'

import { wagmiAdapter, projectId, metadata, networks } from '@/config/web3'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode, useEffect, useMemo, useCallback } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata: metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  },
  themeMode: 'dark', // Set to dark mode, will be overridden by CSS
  themeVariables: {
    // Typography - Match your site's Inter font
    '--w3m-font-family': 'Inter, system-ui, -apple-system, sans-serif',
    '--w3m-font-size-master': '14px',
    
    // Colors - Match your Copoazú Labs color palette
    '--w3m-accent': '#3D7DD6', // Brand Primary
    
    // Border radius - Match your site's 8px radius
    '--w3m-border-radius-master': '8px',
    
  }
})

export function Web3Provider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = useMemo(
    () => cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies),
    [cookies]
  )

  // Optimized theme update function with debouncing
  /*const updateAppKitTheme = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark')
    const modal = document.querySelector('w3m-modal')

    if (modal) {
      const modalElement = modal as HTMLElement
      if (isDark) {
        modalElement.setAttribute('data-theme', 'dark')
        // Update CSS custom properties for dark mode
        modalElement.style.setProperty('--w3m-color-fg-1', '#F5F8FA') // Brand Background for text
        modalElement.style.setProperty('--w3m-color-fg-2', '#C6CED6') // Brand Neutral for secondary text
        modalElement.style.setProperty('--w3m-color-fg-3', '#C6CED6') // Brand Neutral for tertiary text
        modalElement.style.setProperty('--w3m-color-bg-1', '#1B1B2E') // Brand Dark for background
        modalElement.style.setProperty('--w3m-color-bg-2', '#2A2A2A') // Darker background
        modalElement.style.setProperty('--w3m-color-bg-3', '#3A3A3A') // Even darker background
        modalElement.style.setProperty('--w3m-color-overlay', 'rgba(0, 0, 0, 0.8)')
      } else {
        modalElement.setAttribute('data-theme', 'light')
        // Reset to light mode colors
        modalElement.style.setProperty('--w3m-color-fg-1', '#1B1B2E') // Negro Suave for text
        modalElement.style.setProperty('--w3m-color-fg-2', '#C6CED6') // Gris Ceniza for secondary text
        modalElement.style.setProperty('--w3m-color-fg-3', '#C6CED6') // Gris Ceniza for tertiary text
        modalElement.style.setProperty('--w3m-color-bg-1', '#F5F8FA') // Pulpa Crema for background
        modalElement.style.setProperty('--w3m-color-bg-2', '#FFFFFF') // Blanco for secondary background
        modalElement.style.setProperty('--w3m-color-bg-3', '#F5F8FA') // Pulpa Crema for tertiary background
        modalElement.style.setProperty('--w3m-color-overlay', 'rgba(0, 0, 0, 0.4)')
      }
    }
  }, [])

  // Debounced theme update
  const debouncedThemeUpdate = useCallback(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateAppKitTheme, 100)
    }
  }, [updateAppKitTheme])

  // Update AppKit theme based on dark mode
  useEffect(() => {
    const debounced = debouncedThemeUpdate()

    // Initial check
    updateAppKitTheme()

    // Watch for theme changes with optimized observer
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          debounced()
        }
        if (mutation.type === 'childList') {
          // Check if AppKit modal was added
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.tagName === 'W3M-MODAL' || element.querySelector?.('w3m-modal')) {
                setTimeout(debounced, 150) // Small delay to ensure modal is fully rendered
              }
            }
          })
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [updateAppKitTheme, debouncedThemeUpdate])*/

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}