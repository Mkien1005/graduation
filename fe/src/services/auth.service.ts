import { axiosPublic } from '@/utils/axios.instance'

export const registerUser = async (userData: any) => {
  const response = await axiosPublic.post('/api/auth/register', userData)
  console.log('response :>> ', response)
  return response.data
}

export const loginUser = async (credentials: any) => {
  const response = await axiosPublic.post('/api/auth/login', credentials)
  return response.data
}
