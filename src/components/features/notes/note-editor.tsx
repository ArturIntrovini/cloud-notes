'use client'

import { useState, useRef } from 'react'
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
  const isDirtyRef = useRef<boolean>(false)

  async function saveNote() {
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaveStatus('saved')
      isDirtyRef.current = false
    } catch {
      setSaveStatus('error')
    }
  }

  async function handleBack() {
    if (isDirtyRef.current) {
      await saveNote()
    }
    router.push('/notes')
  }

  return (
    <div>
      <header>
        <button onClick={handleBack}>← Back</button>
        {saveStatus === 'saving' && <span>Saving…</span>}
        {saveStatus === 'saved' && <span>Saved</span>}
        {saveStatus === 'error' && <span>Could not save</span>}
      </header>
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          isDirtyRef.current = true
        }}
        placeholder="Title"
        aria-label="Note title"
      />
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          isDirtyRef.current = true
        }}
        placeholder="Start writing…"
        aria-label="Note content"
      />
    </div>
  )
}
