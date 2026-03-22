'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Note } from '@/server/db'
import { CloudHub, SaveStatus } from '@/components/features/notes/cloud-hub'

export type NoteEditorProps = {
  note: Note
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [trashing, setTrashing] = useState(false)
  const isDirtyRef = useRef<boolean>(false)
  const isMountedRef = useRef<boolean>(true)
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const titleRef = useRef<string>(note.title)
  const contentRef = useRef<string>(note.content)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirtyRef.current) {
        e.preventDefault()
        e.returnValue = 'Cloud Notes hasn\'t saved your latest changes yet. Leave anyway?'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      isMountedRef.current = false
      // Abort in-flight save to prevent setState on unmounted component
      abortControllerRef.current?.abort()
      // Cancel pending retry
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [])

  function saveNote(): Promise<void> {
    // Serializes saves — no concurrent saves possible.
    // .catch absorbs prior rejections to keep chain live; logs unexpected errors.
    saveQueueRef.current = saveQueueRef.current
      .catch((err) => {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          console.error('[NoteEditor] save queue error:', err)
        }
      })
      .then(async () => {
        // Abandon queued saves after unmount — prevents post-unmount network requests and state updates.
        if (!isMountedRef.current) return

        // Cancel any pending retry
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current)
          retryTimerRef.current = null
        }

        // Abort any previous in-flight request and create new controller
        abortControllerRef.current?.abort()
        const controller = new AbortController()
        abortControllerRef.current = controller

        setSaveStatus('saving')
        let didSettle = false
        try {
          const res = await fetch(`/api/notes/${note.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleRef.current, content: contentRef.current }),
            signal: controller.signal,
          })
          if (!res.ok) throw new Error('Save failed')
          if (!isMountedRef.current) { didSettle = true; return }
          setSaveStatus('saved')
          isDirtyRef.current = false
          didSettle = true
        } catch (err) {
          // Ignore AbortError — fetch was intentionally cancelled
          if (err instanceof Error && err.name === 'AbortError') { didSettle = true; return }
          if (!isMountedRef.current) { didSettle = true; return }
          setSaveStatus('error')
          didSettle = true
          // Auto-retry after 3 seconds — skip if content is no longer dirty
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null
            if (!isMountedRef.current) return
            if (!isDirtyRef.current) return
            saveNote().catch(() => {})
          }, 3000)
        } finally {
          // Safety net: reset stuck 'saving' status on unexpected throw
          if (!didSettle && isMountedRef.current) setSaveStatus('error')
        }
      })
    return saveQueueRef.current
  }

  function scheduleAutoSave() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
      saveNote().catch(() => {})
    }, 1500)
  }

  async function handleBack() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (isDirtyRef.current) {
      await saveNote()
      if (isDirtyRef.current) {
        if (!window.confirm("Cloud Notes couldn't save your changes. Leave anyway?")) return
      }
    }
    router.push('/notes')
  }

  async function trashNote() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    // Clear dirty flag so any in-flight save does not race with the DELETE
    isDirtyRef.current = false
    setTrashing(true)
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Trash failed')
      router.push('/notes')
    } catch {
      // Silent fail — full error UX in Story 3.3
      setTrashing(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-500/20">
        <button
          onClick={handleBack}
          className="text-primary text-sm font-medium px-3 py-2 min-h-[44px] flex items-center"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <CloudHub mode="editor" saveStatus={saveStatus} />
          <button
            onClick={trashNote}
            disabled={trashing}
            className="text-danger text-sm disabled:opacity-60 min-h-[44px] flex items-center"
          >
            {trashing ? 'Moving…' : 'Move to Trash'}
          </button>
        </div>
      </header>
      <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-4 gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            titleRef.current = e.target.value
            isDirtyRef.current = true
            setSaveStatus('idle')
            scheduleAutoSave()
          }}
          placeholder="Title"
          aria-label="Note title"
          className="text-xl font-semibold text-neutral-900 bg-transparent border-none outline-none placeholder:text-neutral-500 w-full"
        />
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            contentRef.current = e.target.value
            isDirtyRef.current = true
            setSaveStatus('idle')
            scheduleAutoSave()
          }}
          placeholder="Start writing…"
          aria-label="Note content"
          className="flex-1 text-base leading-relaxed text-neutral-900 bg-transparent border-none outline-none resize-none placeholder:text-neutral-500 w-full min-h-[60vh]"
        />
      </div>
    </div>
  )
}
