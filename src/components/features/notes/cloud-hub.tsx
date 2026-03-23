'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type CloudHubProps = {
  mode: 'list' | 'editor'
  saveStatus?: SaveStatus
}

function CloudIcon({ className, 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <svg className={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.414 5.25 5.25 0 0 0-10.233-2.33A4.502 4.502 0 0 0 2.25 15Z" />
    </svg>
  )
}

function PlusIcon({ className, 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <svg className={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function TrashIcon({ className, 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <svg className={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function UserIcon({ className, 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <svg className={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

export function CloudHub({ mode, saveStatus = 'idle' }: CloudHubProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const [prevSaveStatus, setPrevSaveStatus] = useState<SaveStatus>(saveStatus)
  const [displayText, setDisplayText] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  // Derived-state-from-props pattern: update display state when saveStatus changes.
  // Calling setState during render (guarded by prevSaveStatus !== saveStatus) is the
  // React-sanctioned approach for deriving state from props without useEffect.
  if (prevSaveStatus !== saveStatus) {
    setPrevSaveStatus(saveStatus)
    if (saveStatus === 'saving') {
      setDisplayText('Saving…')
      setIsAnimating(false)
    } else if (saveStatus === 'saved') {
      setDisplayText('Saved')
      setIsAnimating(true)
    } else if (saveStatus === 'error') {
      setDisplayText('Could not save now. Trying again…')
      setIsAnimating(false)
    }
    // When 'idle': do NOT clear — let onAnimationEnd handle it naturally
  }

  useEffect(() => {
    if (!isOpen) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    // Move focus to first dock button after dock opens
    const firstBtn = dockRef.current?.querySelector<HTMLButtonElement>('button:not([tabindex="-1"])')
    if (firstBtn) {
      firstBtn.focus()
    } else {
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleAnimationEnd() {
    setDisplayText('')
    setIsAnimating(false)
  }

  if (mode === 'editor') {
    return (
      <div role="status" aria-label="Sync state" className="flex items-center gap-2">
        <CloudIcon className="w-5 h-5 text-primary" aria-hidden={true} />
        {displayText && (
          <span
            className={`text-xs text-neutral-400 ${
              isAnimating
                ? 'animate-[save-fade_2s_ease-in-out_forwards] motion-reduce:animate-none'
                : ''
            }`}
            onAnimationEnd={handleAnimationEnd}
          >
            {displayText}
          </span>
        )}
      </div>
    )
  }

  // List mode
  return (
    <div ref={dockRef} className="relative flex flex-col items-center">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close main menu" : "Open main menu"}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="cloud-hub-dock"
        className="flex items-center justify-center touch-target rounded-full bg-primary text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <CloudIcon className="w-6 h-6" aria-hidden={true} />
      </button>

      <div
        id="cloud-hub-dock"
        role="menu"
        aria-hidden={!isOpen}
        className={`absolute top-full mt-2 flex gap-2 bg-surface-elevated rounded-2xl p-3 shadow-lg transition-all duration-150 motion-reduce:transition-none ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <button
          role="menuitem"
          tabIndex={isOpen ? undefined : -1}
          onClick={() => { router.push('/notes/new'); setIsOpen(false) }}
          aria-label="New Note"
          className="flex flex-col items-center gap-1 text-xs text-primary touch-target rounded-xl hover:bg-primary-soft transition-colors px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-xl focus-visible:outline-none"
        >
          <PlusIcon className="w-5 h-5" aria-hidden={true} />
          <span>New</span>
        </button>
        <button
          role="menuitem"
          tabIndex={isOpen ? undefined : -1}
          onClick={() => { router.push('/trash'); setIsOpen(false) }}
          aria-label="Trash"
          className="flex flex-col items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 touch-target rounded-xl hover:bg-surface transition-colors px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-xl focus-visible:outline-none"
        >
          <TrashIcon className="w-5 h-5" aria-hidden={true} />
          <span>Trash</span>
        </button>
        <button
          role="menuitem"
          tabIndex={isOpen ? undefined : -1}
          onClick={() => { router.push('/profile'); setIsOpen(false) }}
          aria-label="Profile"
          className="flex flex-col items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 touch-target rounded-xl hover:bg-surface transition-colors px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-xl focus-visible:outline-none"
        >
          <UserIcon className="w-5 h-5" aria-hidden={true} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  )
}
