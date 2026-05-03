export type Role = 'user' | 'assistant'

export interface ChartImage {
  fileName: string
  base64: string
}

export interface RetrievedChunk {
  content: string
  score: number
  metadata: Record<string, unknown>
}

export interface Message {
  id: string
  role: Role
  content: string
  images?: ChartImage[]
  codeExecuted?: string
  chunks?: RetrievedChunk[]
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  fileId?: string
  createdAt: Date
}
