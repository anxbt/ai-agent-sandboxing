import { useEffect, useRef } from 'react'
import { User, Bot, Code2 } from 'lucide-react'
import type { Message } from '../types'

interface Props {
  messages: Message[]
  loading: boolean
}

function SkeletonBubble() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: '#E0E0E0' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
        <div style={{ height: 14, width: '60%', borderRadius: 4, background: '#E8E8E8' }} />
        <div style={{ height: 14, width: '85%', borderRadius: 4, background: '#EBEBEB' }} />
        <div style={{ height: 14, width: '45%', borderRadius: 4, background: '#EEEEEE' }} />
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: isUser ? '#5E6AD2' : '#EBEBEB',
        border: `1px solid ${isUser ? '#4A56C0' : '#D8D8D8'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser
          ? <User size={13} color="#fff" strokeWidth={2} />
          : <Bot size={13} color="#939393" strokeWidth={2} />
        }
      </div>

      <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          background: isUser ? '#5E6AD2' : '#FAFAFA',
          color: isUser ? '#fff' : '#3C3C3C',
          borderRadius: isUser ? '9px 2px 9px 9px' : '2px 9px 9px 9px',
          border: `1px solid ${isUser ? '#4A56C0' : '#E0E0E0'}`,
          padding: '10px 14px',
          fontSize: 15,
          fontWeight: 400,
          lineHeight: 1.6,
        }}>
          {msg.content}
        </div>

        {msg.codeExecuted && (
          <details>
            <summary style={{
              fontSize: 12, color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 4,
              userSelect: 'none', cursor: 'pointer', listStyle: 'none',
            }}>
              <Code2 size={12} strokeWidth={1.5} />
              View executed code
            </summary>
            <pre style={{
              marginTop: 6,
              padding: '10px 12px',
              background: '#F5F5F3',
              border: '1px solid #E0E0E0',
              borderRadius: 7,
              fontSize: 12,
              color: '#4A4A4A',
              overflowX: 'auto',
              lineHeight: 1.5,
              fontFamily: 'ui-monospace, Consolas, monospace',
            }}>
              {msg.codeExecuted}
            </pre>
          </details>
        )}

        {msg.images && msg.images.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {msg.images.map((img) => (
              <img
                key={img.fileName}
                src={`data:image/png;base64,${img.base64}`}
                alt={img.fileName}
                style={{
                  maxWidth: '100%',
                  borderRadius: 8,
                  border: '1px solid var(--border-default)',
                  display: 'block',
                }}
              />
            ))}
          </div>
        )}

        <span style={{
          fontSize: 11,
          color: 'var(--text-tertiary)',
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export default function ChatThread({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (messages.length === 0 && !loading) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: '#EBEBEB', border: '1px solid #D8D8D8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bot size={22} color="#939393" strokeWidth={1.5} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#3C3C3C', marginBottom: 6 }}>
            Ask anything about your sales data
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.6 }}>
            Try: "What were total units sold by region?" or "Show revenue trend as a chart"
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          {[
            'Total revenue by product',
            'Sales trend over time',
            'Top performing region',
            'Revenue vs cost breakdown',
          ].map(s => (
            <span key={s} style={{
              padding: '5px 10px', borderRadius: 6,
              border: '1px solid var(--border-default)',
              fontSize: 12, color: 'var(--text-secondary)',
              background: '#FAFAFA',
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '24px 32px',
      display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
      {loading && <SkeletonBubble />}
      <div ref={bottomRef} />
    </div>
  )
}
