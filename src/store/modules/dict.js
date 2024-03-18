const state = {
  dict: new Array()
}
const mutations = {
  SET_DICT: (state, { key, value }) => {
    if (key !== null && key !== "") {
      state.dict.push({
        key: key,
        value: value
      })
    }
  },
}

const actions = {
  // 设置字典
  setDict({ commit }, data) {
    commit('SET_DICT', data)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

