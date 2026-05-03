import { useState, useCallback } from 'react'
import Sidebar, { type IngestStatus } from './components/Sidebar'
import ChatThread from './components/ChatThread'
import ChatInput from './components/ChatInput'
import { askQuestion, ingestUpload } from './api'
import type { Conversation, Message } from './types'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function newConversation(): Conversation {
  return { id: makeId(), title: 'New analysis', messages: [], createdAt: new Date() }
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [newConversation()])
  const [activeId, setActiveId] = useState<string>(() => conversations[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ingestStatus, setIngestStatus] = useState<IngestStatus>('idle')
  const [ingestInfo, setIngestInfo] = useState<string | null>(null)
  const [activeFileId, setActiveFileId] = useState<string | undefined>(undefined)

  const active = conversations.find(c => c.id === activeId) ?? conversations[0]

  const handleNew = useCallback(() => {
    const conv = newConversation()
    setConversations(prev => [conv, ...prev])
    setActiveId(conv.id)
    setError(null)
  }, [])

  const handleSelect = useCallback((id: string) => {
    setActiveId(id)
    setError(null)
  }, [])

  const handleIngest = useCallback(async (file: File) => {
    setIngestStatus('loading')
    setIngestInfo(file.name)
    setError(null)
    try {
      const result = await ingestUpload(file)
      setActiveFileId(result.fileId)
      setIngestInfo(`${result.fileId} · ${result.rowCount} rows, ${result.chunkCount} chunks`)
      setIngestStatus('done')
    } catch (err) {
      setIngestStatus('error')
      setIngestInfo(err instanceof Error ? err.message : 'Ingest failed')
    }
  }, [])

  const handleSubmit = useCallback(async (question: string) => {
    if (loading || !active) return
    setError(null)

    const userMsg: Message = {
      id: makeId(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }

    setConversations(prev => prev.map(c =>
      c.id === activeId
        ? {
            ...c,
            title: c.messages.length === 0 ? question.slice(0, 42) : c.title,
            messages: [...c.messages, userMsg],
          }
        : c
    ))

    setLoading(true)
    try {
      const res = await askQuestion(question, activeFileId)

      const assistantMsg: Message = {
        id: makeId(),
        role: 'assistant',
        content: res.answer,
        chunks: res.chunks,
        timestamp: new Date(),
      }

      setConversations(prev => prev.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, assistantMsg] }
          : c
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Is the backend running on port 3000?')
    } finally {
      setLoading(false)
    }
  }, [loading, active, activeId, activeFileId])

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--surface-base)' }}>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onIngest={handleIngest}
        ingestStatus={ingestStatus}
        ingestInfo={ingestInfo}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100dvh' }}>
        <header style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-base)',
        }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: '#3D3D3D', margin: 0, lineHeight: 1.2 }}>
              {active?.title ?? 'DataMind'}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, marginTop: 2 }}>
              {!active || active.messages.length === 0
                ? activeFileId ? `Dataset: ${activeFileId}` : 'Upload a CSV to get started'
                : `${active.messages.length} message${active.messages.length !== 1 ? 's' : ''}${activeFileId ? ` · ${activeFileId}` : ''}`}
            </p>
          </div>
        </header>

        {error && (
          <div style={{
            margin: '8px 24px 0',
            padding: '8px 12px',
            borderRadius: 7,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            fontSize: 13,
            color: '#B91C1C',
          }}>
            {error}
          </div>
        )}

        <ChatThread messages={active?.messages ?? []} loading={loading} />
        <ChatInput onSubmit={handleSubmit} disabled={loading} />
      </main>
    </div>
  )
}
