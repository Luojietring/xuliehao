import request from './request'

// 管理员登录
export function adminLogin(username, password) {
  return request({
    url: '/admin/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

// 添加序列号
export function addSerial(data) {
  return request({
    url: '/admin/serial',
    method: 'post',
    data
  })
}

// 获取序列号列表
export function getSerialList(params) {
  return request({
    url: '/admin/serials',
    method: 'get',
    params
  })
}

// 修改序列号状态
export function updateSerialStatus(id, status) {
  return request({
    url: `/admin/serial/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 修改序列号信息
export function updateSerial(id, data) {
  return request({
    url: `/admin/serial/${id}`,
    method: 'put',
    data
  })
}

// 删除序列号
export function deleteSerial(id) {
  return request({
    url: `/admin/serial/${id}`,
    method: 'delete'
  })
}

