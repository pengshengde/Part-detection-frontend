import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询缺陷类型列表
export function listDefectType(query) {
  return request({
    url: '/quality/defect/list',
    method: 'get',
    params: query
  })
}



// 查询 缺陷类型详细
export function getDefectType(defectTypeId) {
  return request({
    url: '/quality/defect/' + defectTypeId,
    method: 'get'
  })
}

// 新增缺陷类型
export function addDefectType(data) {
  return request({
    url: '/quality/defect',
    method: 'post',
    data: data
  })
}

// 修改缺陷类型
export function updateDefectType(data) {
  return request({
    url: '/quality/defect',
    method: 'put',
    data: data
  })
}

// 删除缺陷类型
export function delDefectType(defectTypeId) {
  return request({
    url: '/quality/defect/' + defectTypeId,
    method: 'delete'
  })
}




