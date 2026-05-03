import type { Message, RetrievedChunk } from './types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export interface AskResponse {
  answer: string
  chunks: RetrievedChunk[]
}

export interface IngestResult {
  fileId: string
  source: string
  rowCount: number
  chunkCount: number
}

export async function askQuestion(question: string, fileId?: string): Promise<AskResponse> {
  const res = await fetch(`${BASE}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, fileId }),
  })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  const data = await res.json()
  return {
    answer: data.answer ?? JSON.stringify(data),
    chunks: data.chunks ?? [],
  }
}

export async function ingestPath(filePath: string, fileId?: string): Promise<IngestResult> {
  const res = await fetch(`${BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath, fileId }),
  })
  if (!res.ok) throw new Error(`Ingest error ${res.status}`)
  return res.json()
}

export async function ingestUpload(file: File, fileId?: string): Promise<IngestResult> {
  const form = new FormData()
  form.append('file', file)
  if (fileId) form.append('fileId', fileId)
  const res = await fetch(`${BASE}/api/ingest/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(`Upload error ${res.status}`)
  return res.json()
}

export function buildHistory(messages: Message[]) {
  return messages.map((m) => ({ role: m.role, content: m.content }))
}
