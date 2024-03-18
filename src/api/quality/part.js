import request from '@/utils/request'

// 查询已检测的零件
export function listPart(query) {
  return request({
    url: '/quality/part/list',
    method: 'get',
    params: query
  })
}

// 零件检测结果修改
export function changePartResult(partId, detectResult) {
  const data = {
    partId,
    detectResult
  }
  return request({
    url: '/quality/part/changeResult',
    method: 'put',
    data: data
  })
}


// 修改已检测零件
export function updatePart(data) {
  return request({
    url: '/quality/part',
    method: 'put',
    data: data
  })
}

// 查询未被检测的零件详细信息
export function getPart(partId) {
  return request({
    url: '/quality/part/' + partId ,
    method: 'get'
  })
}

// 删除未检测零件
export function delPart(partIds) {
  return request({
    url: '/quality/part/' + partIds ,
    method: 'delete'
  })
}


// 查询零件下的所有图片
export function allocatedImageList(query){
  return request({
    url: '/quality/part/authImage/allocatedList',
    method: 'get',
    params: query
  })
}

// 查询零件下未授权所有图片
export function unallocatedImageList(query){
  return request({
    url: '/quality/part/authImage/unallocatedList',
    method: 'get',
    params: query
  })
}

// 批次选择零件
export function authImageSelectAll(data){
  return request({
    url: '/quality/part/authImage/selectAll',
    method: 'put',
    params: data
  })
}

// 取消图片
export function authImageCancel(data){
  return request({
    url: '/quality/part/authImage/cancel',
    method: 'put',
    params: data
  })
}

// 批次取消图片
export function authImageCancelAll(data){
  return request({
    url: '/quality/part/authImage/cancelAll',
    method: 'put',
    params: data
  })
}


// 查询某零件下的某张图片
export function getImage(imageId){
  return request({
    url: '/quality/part/authImage/' + imageId,
    method: 'get'
  })
}
