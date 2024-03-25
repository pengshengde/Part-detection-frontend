import request from "@/utils/request";



// 查询检测设备的零件信息
export function listDevPart(query) {
  return request({
    url: "/quality/statistic/list",
    method: "get",
    params: query
  })
}

// 查询批次信息
export function listBatchLine(query) {
  return request({
    url: "/quality/statistic/getBatchInfo",
    method: "get",
    params: query
  })
}

// 查询缺陷类型列表
export function getStatisticInfo(query) {
  return request({
    url: '/quality/statistic/getStatisticInfo',
    method: 'get',
    params: query
  })
}

