import { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

interface Props {
  onSubmit: (value: string) => void
  disabled: boolean
}

export default function ChatInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const canSubmit = value.trim().length > 0 && !disabled

  return (
    <div style={{
      padding: '12px 24px 20px',
      borderTop: '1px solid var(--border-default)',
      background: 'var(--surface-base)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        background: '#FAFAFA',
        border: '1px solid var(--border-default)',
        borderRadius: 9,
        padding: '10px 10px 10px 14px',
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about your sales data…"
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            resize: 'none',
            outline: 'none',
            fontSize: 15,
            fontWeight: 400,
            color: '#3C3C3C',
            lineHeight: 1.5,
            overflowY: 'hidden',
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={submit}
          disabled={!canSubmit}
          aria-label="Send message"
          style={{
            width: 32,
            height: 32,
            borderRadius: 7,
            border: 'none',
            background: canSubmit ? '#5E6AD2' : '#E0E0E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <ArrowUp size={15} color={canSubmit ? '#fff' : '#ABABAB'} strokeWidth={2.5} />
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6, textAlign: 'center' }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
