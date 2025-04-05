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

export async function sendMessage(content: string, sessionId?: string) {
  const res = await fetch('http://localhost:5000/api/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      sessionId,
    }),
    // mode: 'cors',
    credentials: 'include',
  })
  console.log('res :>> ', res)
  if (!res) {
    throw new Error('Failed to send message')
  }
  const reader = res?.body?.getReader()
  const decoder = new TextDecoder() // Dùng để decode binary data thành text

  let data = ''
  // Đọc dữ liệu streaming
  const readStream = async () => {
    while (true) {
      const { done, value }: any = await reader?.read()
      if (done) {
        console.log('Stream hoàn tất')
        break
      }
      // Giải mã chunk dữ liệu
      const chunk = decoder.decode(value, { stream: true })
      console.log(chunk)
      data += chunk
    }
    console.log('data :>> ', data)
  }

  // Bắt đầu đọc stream
  readStream().catch((err) => console.error('Lỗi khi đọc stream:', err))
}
