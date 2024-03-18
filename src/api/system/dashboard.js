import request from '@/utils/request'

// 获取零件检测结果的方法

export function getDetectResult(){
  return request({
    url: '/getDetectResult',
    method: 'get'
  })
}

export function getEquipmentStatus(){
  return request({
    url: '/api/sysEquipmentStatus/list',
    method: 'get'
  })
}
