import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        // token 过期或无效，清除 token 并跳转到登录页
        localStorage.removeItem('admin_token')
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login'
        }
      }
      return Promise.reject(data || error.message)
    }
    return Promise.reject(error.message)
  }
)

export default request

