import request from '@/utils/request'

// 查询未被检测的零件批次
export function listBatchF(query) {
  return request({
    url: '/quality/batchF/list',
    method: 'get',
    params: query
  })
}

// 查询未被检测的零件批次详细信息
export function getBatchF(batchId) {
  return request({
    url: '/quality/batchF/' + batchId ,
    method: 'get'
  })
}

// 新增未被检测的零件批次
export function addBatchF(data) {
  return request({
    url: '/quality/batchF',
    method: 'post',
    data: data
  })
}

// 修改未检测零件批次
  export function updateBatchF(data) {
    return request({
      url: '/quality/batchF',
      method: 'put',
      data: data
    })
  }

// 删除未检测零件批次
export function delBatchF(batchIds) {
  return request({
    url: '/quality/batchF/' + batchIds ,
    method: 'delete'
  })
}
