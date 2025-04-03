// components/Sidebar.js
'use client'
import { useEffect, useState } from 'react'

export default function Sidebar({
  conversations,
  createNewConversation,
  selectConversation,
  currentConversation,
  onDeleteConversation,
  hideSidebar,
}: any) {
  const [showDelete, setShowDelete] = useState(null)
  useEffect(() => {})
  return (
    <div className='flex flex-col h-full text-white'>
      <div className='p-4 flex justify-between'>
        <button
          onClick={hideSidebar}
          className='rounded hover:bg-gray-600 p-2 mb-2 flex items-start hover:cursor-pointer transition-colors duration-200'
          title='Đóng sidebar'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </button>
        <button
          onClick={createNewConversation}
          title='Tạo cuộc hội thoại mới'
          className='hover:bg-gray-600 hover:cursor-pointer text-white font-bold p-2 mb-2 rounded items-end right-2 transition-colors duration-200'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
            />
          </svg>
        </button>
      </div>

      <div className='overflow-y-auto flex-1 px-3'>
        <h2 className='text-sm font-semibold text-gray-400 mb-2 px-2'>Gần đây</h2>
        {conversations.length === 0 ? (
          <div className='text-gray-400 text-lg px-2'>Chưa có cuộc hội thoại nào</div>
        ) : (
          <ul>
            {conversations.map((conversation: any) => (
              <li key={conversation.id} className='mb-1 relative'>
                <button
                  onClick={() => selectConversation(conversation.id)}
                  onMouseEnter={() => setShowDelete(conversation.id)}
                  onMouseLeave={() => setShowDelete(null)}
                  className={`w-full text-left px-3 py-3 rounded-md flex items-center hover:bg-gray-700 transition-colors ${
                    currentConversation === conversation.id ? 'bg-gray-700' : ''
                  }`}>
                  <div className='flex-1 truncate pr-8'>
                    <p className='text-lg font-medium'>{conversation.title}</p>
                    <p className='text-sm text-gray-400'>{conversation.date}</p>
                  </div>

                  {(showDelete === conversation.id || currentConversation === conversation.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(conversation.id)
                      }}
                      className='absolute right-2 p-1 text-gray-400 hover:text-white hover:bg-red-600 rounded'
                      title='Xóa cuộc hội thoại'>
                      <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    </button>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className='mt-auto p-4 border-t border-gray-700'>
        <div className='flex items-center'>
          <div className='h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center mr-2'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
          </div>
          <div className='text-lg'>
            <p className='font-medium'>Người dùng</p>
            <p className='text-lg text-gray-400'>user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
