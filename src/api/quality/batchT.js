import request from '@/utils/request'

// 查询已检测的零件批次
export function listBatchT(query) {
  return request({
    url: '/quality/batchT/list',
    method: 'get',
    params: query
  })
}
// 查询未被检测的零件批次详细信息
export function getBatchT(batchId) {
  return request({
    url: '/quality/batchT/' + batchId ,
    method: 'get'
  })
}


// 修改已检测零件批次
export function updateBatchT(data) {
  return request({
    url: '/quality/batchT',
    method: 'put',
    data: data
  })
}
// 删除未检测零件批次
export function delBatchT(batchIds) {
  return request({
    url: '/quality/batchT/' + batchIds ,
    method: 'delete'
  })
}

// 查询零件批次下的所有零件
export function allocatedPartList(query){
  return request({
      url: '/quality/batchT/authPart/allocatedList',
      method: 'get',
      params: query
    })
}

// 查询非零件批次下的所有零件
export function unallocatedPartList(query){
  return request({
      url: '/quality/batchT/authPart/unallocatedList',
      method: 'get',
      params: query
    })
}

// 批次选择零件
export function authPartSelectAll(data){
  return request({
    url: '/quality/batchT/authPart/selectAll',
    method: 'put',
    params: data
  })
}

// 批次取消零件
export function authPartCancelAll(data){
  return request({
    url: '/quality/batchT/authPart/cancelAll',
    method: 'put',
    params: data
  })
}

// 取消零件
export function authPartCancel(data){
  return request({
    url: '/quality/batchT/authPart/cancel',
    method: 'put',
    params: data
  })
}




