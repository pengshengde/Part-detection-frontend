import { getDetectResult } from '@/api/system/dashboard'


const dashboard = {
  state : {
    all : '',
    day : '',
    commonAll : '',
    commonDay : '',
    detectAll : '',
    detectDay : '',
  },

  mutations : {
    SET_ALL: (state, total) => {
      state.total = total
    },

    SET_DAY: (state, day) => {
      state.day = day
    },

    SET_COMMON_ALL: (state, commonAll) => {
      state.commonAll = commonAll
    },

    SET_COMMON_DAY: (state, commonDay) => {
      state.commonDay = commonDay
    },

    SET_DETECT_ALL: (state, detectAll) => {
      state.detectAll = detectAll
    },

    SET_DETECT_DAY: (state, detectDay) => {
      state.detectDay = detectDay
    }
  },

  actions : {
    // 获取后端的零件检测结果
    GetDetectResult({ commit ,state })  {
      getDetectResult().then(res  => {
        commit('SET_ALL', res.all)
        commit('SET_DAY', res.day)
        commit('SET_COMMON_ALL', res.commonAll)
        commit('SET_COMMON_DAY', res.commonDay)
        commit('SET_DETECT_ALL', res.detectAll)
        commit('SET_DETECT_DAY', res.detectDay)
      })
    }
  }
}


export default dashboard
