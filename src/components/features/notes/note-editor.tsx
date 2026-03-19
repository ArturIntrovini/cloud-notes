'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Note } from '@/server/db'

export type NoteEditorProps = {
  note: Note
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [trashing, setTrashing] = useState(false)
  const isDirtyRef = useRef<boolean>(false)
  const isSavingRef = useRef<boolean>(false)
  const titleRef = useRef<string>(note.title)
  const contentRef = useRef<string>(note.content)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [])

  async function saveNote() {
    if (isSavingRef.current) return
    isSavingRef.current = true
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleRef.current, content: contentRef.current }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaveStatus('saved')
      isDirtyRef.current = false
    } catch {
      setSaveStatus('error')
    } finally {
      isSavingRef.current = false
    }
  }

  function scheduleAutoSave() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
      saveNote()
    }, 1500)
  }

  async function handleBack() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (isDirtyRef.current) {
      await saveNote()
      if (isDirtyRef.current) return
    }
    router.push('/notes')
  }

  async function trashNote() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
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
    <div>
      <header>
        <button onClick={handleBack}>← Back</button>
        <button onClick={trashNote} disabled={trashing}>{trashing ? 'Moving…' : 'Move to Trash'}</button>
        {saveStatus === 'saving' && <span>Saving…</span>}
        {saveStatus === 'saved' && <span>Saved</span>}
        {saveStatus === 'error' && <span>Could not save</span>}
      </header>
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
      />
    </div>
  )
}
