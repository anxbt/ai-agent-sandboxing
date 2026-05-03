import { useRef } from 'react'
import { MessageSquare, Plus, BarChart2, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import type { Conversation } from '../types'

export type IngestStatus = 'idle' | 'loading' | 'done' | 'error'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onIngest: (file: File) => void
  ingestStatus: IngestStatus
  ingestInfo: string | null
}

export default function Sidebar({ conversations, activeId, onSelect, onNew, onIngest, ingestStatus, ingestInfo }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onIngest(file)
    e.target.value = ''
  }

  const statusIcon = {
    idle: <Upload size={12} strokeWidth={2} />,
    loading: <Loader2 size={12} strokeWidth={2} style={{ opacity: 0.7 }} />,
    done: <CheckCircle2 size={12} strokeWidth={2} color="#4ADE80" />,
    error: <AlertCircle size={12} strokeWidth={2} color="#F87171" />,
  }[ingestStatus]

  const statusColor = {
    idle: 'var(--text-tertiary)',
    loading: 'var(--text-secondary)',
    done: '#4ADE80',
    error: '#F87171',
  }[ingestStatus]

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: 'var(--surface-raised)',
      borderRight: '1px solid var(--border-raised)',
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border-raised)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <BarChart2 size={16} color="#5E6AD2" strokeWidth={2} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#ECEEE4', letterSpacing: '-0.2px' }}>
          DataMind
        </span>
      </div>

      {/* New chat */}
      <div style={{ padding: '12px 12px 8px' }}>
        <button
          onClick={onNew}
          aria-label="New conversation"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 10px',
            borderRadius: 7,
            border: '1px solid var(--border-raised)',
            background: 'transparent',
            color: 'var(--text-tertiary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#3A3940')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Plus size={14} strokeWidth={2} />
          New analysis
        </button>
      </div>

      {/* Conversation list */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {conversations.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '8px 8px' }}>
            No conversations yet
          </p>
        )}
        {conversations.map(conv => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 8px',
              borderRadius: 7,
              border: 'none',
              background: conv.id === activeId ? '#3A3940' : 'transparent',
              color: conv.id === activeId ? '#ECEEE4' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              marginBottom: 1,
            }}
            onMouseEnter={e => { if (conv.id !== activeId) e.currentTarget.style.background = '#2A292B' }}
            onMouseLeave={e => { if (conv.id !== activeId) e.currentTarget.style.background = 'transparent' }}
          >
            <MessageSquare size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {conv.title}
            </span>
          </button>
        ))}
      </nav>

      {/* Dataset section */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-raised)' }}>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>Dataset</p>

        {ingestInfo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 8px',
            borderRadius: 6,
            background: '#232224',
            border: '1px solid var(--border-raised)',
            marginBottom: 8,
          }}>
            {statusIcon}
            <span style={{ fontSize: 12, color: statusColor, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ingestInfo}
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-label="Upload CSV file"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={ingestStatus === 'loading'}
          aria-label="Upload CSV file"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 10px',
            borderRadius: 7,
            border: '1px solid var(--border-raised)',
            background: 'transparent',
            color: ingestStatus === 'loading' ? 'var(--text-tertiary)' : '#B5B5B5',
            fontSize: 12,
            fontWeight: 500,
            cursor: ingestStatus === 'loading' ? 'not-allowed' : 'pointer',
            opacity: ingestStatus === 'loading' ? 0.5 : 1,
          }}
          onMouseEnter={e => { if (ingestStatus !== 'loading') e.currentTarget.style.background = '#3A3940' }}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Upload size={12} strokeWidth={2} />
          {ingestStatus === 'loading' ? 'Ingesting…' : 'Upload CSV'}
        </button>
      </div>
    </aside>
  )
}
