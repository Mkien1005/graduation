// pages/index.js
'use client'
import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import Sidebar from '../../components/Sidebar'
// import { saveConversation, getConversation, getSortedConversations, deleteConversation } from '../services/chatStorage';
interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<any>([])
  const [currentConversation, setCurrentConversation] = useState<string>('')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Tải danh sách cuộc hội thoại khi component được mount
  useEffect(() => {
    // Chỉ chạy ở phía client
    if (typeof window !== 'undefined') {
      //   const loadedConversations = getSortedConversations();
      //   setConversations(loadedConversations);
    }
  }, [])

  // Tự động cuộn xuống khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Lưu tin nhắn vào localStorage khi messages hoặc currentConversation thay đổi
  //   useEffect(() => {
  //     if (currentConversation && messages.length > 0) {
  //       const conversation = getConversation(currentConversation);
  //       if (conversation) {
  //         saveConversation(currentConversation, conversation.title, messages);
  //       }
  //     }
  //   }, [messages, currentConversation]);

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (input.trim() === '') return

    // Tạo một conversation mới nếu chưa có
    let conversationId = currentConversation
    if (!conversationId) {
      conversationId = Date.now().toString()
      const newConversation = {
        id: conversationId,
        title: input.length > 30 ? input.substring(0, 30) + '...' : input,
        date: new Date().toLocaleDateString(),
        messages: [],
      }

      // Lưu vào state và storage
      //   saveConversation(conversationId, newConversation.title, []);
      setConversations([newConversation, ...conversations])
      setCurrentConversation(conversationId)
    }

    // Thêm tin nhắn của người dùng
    const userMessage: Message = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Gọi API để lấy phản hồi
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      })

      if (!response.ok) {
        throw new Error('Lỗi khi gọi API')
      }

      const data = await response.json()

      // Thêm phản hồi từ AI
      const newMessages: Message[] = [...updatedMessages, { role: 'assistant', content: data.message }]
      setMessages(newMessages)

      // Lưu tin nhắn vào localStorage
      //   saveConversation(conversationId, conversations.find(c => c.id === conversationId)?.title || 'Cuộc hội thoại mới', newMessages);

      // Cập nhật danh sách cuộc hội thoại
      //   setConversations(getSortedConversations());
    } catch (error) {
      console.error('Error:', error)
      // Hiển thị thông báo lỗi
      const newMessages: Message[] = [...updatedMessages, { role: 'assistant', content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.' }]
      setMessages(newMessages)

      // Vẫn lưu lỗi vào localStorage để đảm bảo lịch sử nhất quán
      //   saveConversation(conversationId, conversations.find(c => c.id === conversationId)?.title || 'Cuộc hội thoại mới', newMessages);
    } finally {
      setIsLoading(false)
    }
  }

  const createNewConversation = () => {
    setCurrentConversation('')
    setMessages([])
    setIsMobileSidebarOpen(false)
  }

  const selectConversation = (id: string) => {
    // const conversation = getConversation(id);
    // if (conversation) {
    //   setCurrentConversation(id);
    //   setMessages(conversation.messages || []);
    //   setIsMobileSidebarOpen(false);
    // }
  }

  const handleDeleteConversation = (id: string) => {
    // deleteConversation(id);
    // if (currentConversation === id) {
    //   createNewConversation();
    // }
    // setConversations(getSortedConversations());
  }

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen)
  }

  const hideSidebar = () => {
    setIsMobileSidebarOpen(false)
    setIsDesktopSidebarOpen(false)
  }

  return (
    <div className='flex h-screen bg-gray-100'>
      <Head>
        <title>Chat App</title>
        <meta name='description' content='Chat application similar to ChatGPT' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {/* Sidebar cho màn hình lớn */}
      {isDesktopSidebarOpen && (
        <div className='hidden md:block md:w-64 bg-gray-900'>
          <Sidebar
            conversations={conversations}
            createNewConversation={createNewConversation}
            selectConversation={selectConversation}
            currentConversation={currentConversation}
            onDeleteConversation={handleDeleteConversation}
            hideSidebar={hideSidebar}
          />
        </div>
      )}

      {/* Sidebar cho màn hình di động */}
      {isMobileSidebarOpen && (
        <div className='fixed inset-0 z-20 bg-black bg-opacity-50' onClick={() => setIsMobileSidebarOpen(false)}>
          <div className='absolute left-0 top-0 h-full w-64 bg-gray-900' onClick={(e) => e.stopPropagation()}>
            <Sidebar
              conversations={conversations}
              createNewConversation={createNewConversation}
              selectConversation={selectConversation}
              currentConversation={currentConversation}
              onDeleteConversation={handleDeleteConversation}
              hideSidebar={hideSidebar}
            />
          </div>
        </div>
      )}

      <div className='flex flex-col flex-1'>
        <header className='bg-gray-800 text-white p-4 shadow flex items-center'>
          {!isDesktopSidebarOpen && (
            <button
              className='rounded hover:bg-gray-600 p-2 mb-2 flex items-start hover:cursor-pointer transition-colors duration-200'
              onClick={toggleDesktopSidebar}
              title='Mở sidebar'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
          )}

          {!isMobileSidebarOpen && (
            <button className='mr-4 md:hidden' onClick={() => setIsMobileSidebarOpen(true)} title='Mở sidebar'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
          )}

          <h1 className='ml-2 text-xl font-bold'>ICTU Tutor - Trợ lý học tập Kỹ thuật lập trình</h1>
        </header>

        <main className='flex-1 p-4 overflow-hidden flex flex-col'>
          <div className='flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow p-4'>
            {messages.length === 0 ? (
              <div className='flex items-center justify-center h-full text-gray-400'>
                <p>Bắt đầu một cuộc trò chuyện mới</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 w-max ${
                    message.role === 'user' ? 'bg-blue-100 rounded-lg p-3 ml-auto max-w-3xl' : 'bg-gray-100 rounded-lg p-3 mr-auto max-w-3xl'
                  }`}>
                  <p className='whitespace-pre-wrap text-black break-words max-w-full'>{message.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className='bg-gray-100 rounded-lg p-3 mr-auto max-w-3xl'>
                <p className='text-gray-600'>Đang trả lời...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className='flex gap-2'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Nhập tin nhắn của bạn...'
              className='flex-1 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              disabled={isLoading}
            />
            <button
              type='submit'
              disabled={isLoading || input.trim() === ''}
              className='bg-blue-500 p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300'>
              Gửi
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}
