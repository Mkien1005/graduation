import { axiosInstance } from '@/utils/axios.instance'

export async function getConversations() {
  const res = await axiosInstance.get('/api/chat/sessions')
  if (!res) {
    throw new Error('Failed to fetch conversations')
  }
  return res
}

export async function getMessages(sessionId: string) {
  const res = await axiosInstance.get(`/api/chat/messages/${sessionId}`)
  if (!res) {
    throw new Error('Failed to fetch messages')
  }
  return res
}

export async function createSession(title: string) {
  const res = await axiosInstance.post('/api/chat/session', { title })
  if (!res) {
    throw new Error('Failed to create session')
  }
  return res
}

export async function sendMessage(sessionId: string, content: string) {
  const res = await axiosInstance.post('/api/chat/message', { sessionId, content })
  if (!res) {
    throw new Error('Failed to send message')
  }
  return res
}
