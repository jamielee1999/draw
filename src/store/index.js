import Vue from 'vue';
import Vuex from 'vuex';
import {
  setData,
  resultField,
  newLotteryField,
  listField,
  getNumberOfPeople,
  updateNumberOfPeople
} from '@/helper/index';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: {
      name: '果實夥伴尾牙抽獎',
      number: getNumberOfPeople()
    },
    result: {},
    newLottery: [],
    list: [],
    photos: []
  },
  mutations: {
    setClearConfig(state) {
      state.config = {
        name: '果實夥伴尾牙抽獎',
        number: getNumberOfPeople(state)
      };
      state.newLottery = [];
    },
    setClearList(state) {
      state.list = [];
    },
    setClearPhotos(state) {
      state.photos = [];
    },
    setClearResult(state) {
      state.result = {};
    },
    setClearStore(state) {
      state.config = {
        name: '果實夥伴尾牙抽獎',
        number: getNumberOfPeople()
      };
      state.result = {};
      state.newLottery = [];
      state.list = [];
      state.photos = [];
    },
    setConfig(state, config) {
      state.config = config;
    },
    setResult(state, result = {}) {
      state.result = result;

      setData(resultField, state.result);
    },
    setNewLottery(state, newLottery) {
      if (state.newLottery.find(item => item.name === newLottery.name)) {
        return;
      }
      state.newLottery.push(newLottery);
      setData(newLotteryField, state.newLottery);
    },
    setList(state, list) {
      //
      const arr = state.list;
      //debugger
      // TODO: import fixed data here without import
      /*
      arr = [
        {key: 1, name: 'Kelly'},
        {key: 1, name: 'Kelly'},
        {key: 1, name: 'Kelly'},
        {key: 1, name: 'Kelly'},
        {key: 1, name: 'Kelly'}
      ]
      */
      list.forEach(item => {
        const arrIndex = arr.findIndex(data => data.key === item.key);
        if (arrIndex > -1) {
          arr[arrIndex].name = item.name;
        } else {
          arr.push(item);
        }
      });
      state.list = arr;
      updateNumberOfPeople(state);
      setData(listField, arr);
    },
    setPhotos(state, photos) {
      state.photos = photos;
    }
  },
  actions: {},
  modules: {}
});
