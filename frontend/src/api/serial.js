import request from './request'

// 查询序列号
export function querySerial(serialNumber) {
  return request({
    url: `/serial/${serialNumber}`,
    method: 'get'
  })
}

