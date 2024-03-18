import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";


// 查询签名列表
export function listSign(query) {
  return request(
    {
      url: '/quality/sign/list',
      method: 'get',
      params: query
    }
  )
}

// 查询签名详细
export function getSign(signId) {
  return request(
    {
      url:  '/quality/sign/' + parseStrEmpty(signId),
      method: 'get'
    }
  )
}

// 新增AppId
export function addAppId(data) {
  return request({
    url: '/quality/sign',
    method: 'post',
    data: data
  })
}

// 修改AppId
export function updateAppId(data) {
  return request({
    url: '/quality/sign',
    method: 'put',
    data: data
  })
}

// 删除AppId
export function delAppId(signId) {
  return request({
    url: '/quality/sign/' + signId,
    method: 'delete'
  })
}



