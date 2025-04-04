'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/services/auth.service'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Đây là đoạn mã mẫu cho việc đăng nhập - thay thế bằng API thực tế của bạn
      const response = await loginUser({ email, password, rememberMe })

      if (!response) {
        throw new Error('Đăng nhập thất bại!')
      }

      // Đăng nhập thành công - chuyển hướng đến trang chính
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    // Xử lý đăng nhập bằng mạng xã hội - thay thế bằng logic thực tế
    console.log(`Đăng nhập với ${provider}`)
    // router.push(`/api/auth/${provider}`);
  }

  return (
    <div className='min-h-screen bg-indigo-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl w-full flex bg-white rounded-xl shadow-md overflow-hidden'>
        {/* Phần hình ảnh bên trái */}
        <div className='hidden md:block w-1/2 bg-cover bg-center' style={{ backgroundImage: 'url("/images/login-background.webp")' }}>
          {/* Bạn có thể thay thế bằng Image component nếu muốn */}
        </div>

        {/* Phần form đăng nhập */}
        <div className='w-full md:w-1/2 py-8 px-6 md:px-12'>
          <div className='text-center mb-8'>
            <div className='flex justify-center mb-6'>
              <svg className='h-14 w-14 text-indigo-600' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M12 2L2 7L12 12L22 7L12 2Z' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M2 17L12 22L22 17' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M2 12L12 17L22 12' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-indigo-600'>ICTU TutorAI</h2>
            <p className='text-sm text-gray-500 mt-1'>Đăng nhập để truy cập vào hệ thống học tập</p>
          </div>

          {error && <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm'>{error}</div>}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 text-zinc-950 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                placeholder='Nhập email của bạn'
              />
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                Mật khẩu
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                placeholder='Nhập mật khẩu của bạn'
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  name='remember-me'
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                />
                <label htmlFor='remember-me' className='ml-2 block text-sm text-gray-700'>
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className='text-sm'>
                <Link href='/forgot-password' className='font-medium text-indigo-600 hover:text-indigo-500'>
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'>
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>Hoặc đăng nhập với</span>
              </div>
            </div>

            <div className='mt-6 grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => handleSocialLogin('google')}
                className='w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'>
                <svg className='h-5 w-5 mr-2' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z'
                    fill='#4285F4'
                  />
                </svg>
                Google
              </button>

              <button
                type='button'
                onClick={() => handleSocialLogin('facebook')}
                className='w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'>
                <svg className='h-5 w-5 mr-2' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
                    fill='#1877F2'
                  />
                </svg>
                Facebook
              </button>
            </div>
          </div>

          <div className='mt-8 text-center'>
            <p className='text-sm text-gray-600'>
              Bạn chưa có tài khoản?{' '}
              <Link href='/register' className='font-medium text-indigo-600 hover:text-indigo-500'>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
