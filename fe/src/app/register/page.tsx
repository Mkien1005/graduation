'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ReCAPTCHA from 'react-google-recaptcha'
import { registerUser } from '@/services/auth.service'
import Swal from 'sweetalert2'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const router = useRouter()

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

  const handleRecaptchaChange = (token: any) => {
    setRecaptchaToken(token)
  }

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Xác thực form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Kiểm tra email
    if (!formData.email) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Kiểm tra họ tên
    if (!formData.fullName) {
      newErrors.fullName = 'Họ tên không được để trống'
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự'
    }

    // Kiểm tra mật khẩu
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
    }

    // Kiểm tra xác nhận mật khẩu
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    // Kiểm tra reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Vui lòng xác thực reCAPTCHA'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setServerError('')

    try {
      // Gọi API đăng ký - thay thế bằng API thực tế của bạn
      const response = await registerUser({
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        captchaToken: recaptchaToken,
      })
      if (!response) {
        throw new Error('Đăng ký không thành công')
      }
      Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công',
        text: 'Vui lòng kiểm tra email để kích hoạt tài khoản',
        showConfirmButton: true,
      }).then(() => {
        router.push('/login')
      })
    } catch (err: any) {
      console.log('err :>> ', err)
      setServerError(err?.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký')
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {}, [])

  return (
    <div className='min-h-screen bg-indigo-300 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl w-full flex bg-white rounded-xl shadow-md overflow-hidden'>
        {/* Phần hình ảnh bên trái */}
        <div className='hidden md:block w-1/2 bg-cover bg-center' style={{ backgroundImage: 'url("/images/login-background.webp")' }}>
          {/* Bạn có thể thay thế bằng Image component nếu muốn */}
        </div>

        {/* Phần form đăng ký */}
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
            <p className='text-sm text-gray-500 mt-1'>Đăng ký tài khoản mới</p>
          </div>

          {serverError && <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm'>{serverError}</div>}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                Email <span className='text-red-500'>*</span>
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block text-gray-700 w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder='Nhập email của bạn'
              />
              {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email}</p>}
            </div>

            <div>
              <label htmlFor='fullName' className='block text-sm font-medium text-gray-700'>
                Họ và tên <span className='text-red-500'>*</span>
              </label>
              <input
                id='fullName'
                name='fullName'
                type='text'
                autoComplete='name'
                value={formData.fullName}
                onChange={handleChange}
                className={`mt-1 block text-gray-700 w-full px-3 py-2 border ${
                  errors.fullName ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder='Nhập họ và tên của bạn'
              />
              {errors.fullName && <p className='mt-1 text-sm text-red-600'>{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                Mật khẩu <span className='text-red-500'>*</span>
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='new-password'
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block text-gray-700 w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder='Tạo mật khẩu mới'
              />
              {errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password}</p>}
              <p className='mt-1 text-xs text-gray-500'>Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                Xác nhận mật khẩu <span className='text-red-500'>*</span>
              </label>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                autoComplete='new-password'
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block text-gray-700 w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder='Nhập lại mật khẩu'
              />
              {errors.confirmPassword && <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword}</p>}
            </div>
            <div className='mt-4'>{recaptchaSiteKey && <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={handleRecaptchaChange} />}</div>

            <div className='mt-6'>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'>
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </div>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Bạn đã có tài khoản?{' '}
              <Link href='/login' className='font-medium text-indigo-600 hover:text-indigo-500'>
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
