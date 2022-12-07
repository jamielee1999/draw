import Vue from 'vue';
import Vuex from 'vuex';
import {
  setData,
  resultField,
  newLotteryField,
  listField,
  configField,
  getNumberOfPeople,
  updateNumberOfPeople
} from '@/helper/index';

Vue.use(Vuex);
const lotteryName = '抽獎程式';
export default new Vuex.Store({
  state: {
    config: {
      name: lotteryName,
      number: getNumberOfPeople()
    },
    result: {},
    newLottery: [],
    list: [],
    photos: []
  },
  mutations: {
    clearConfig(state) {
      state.config = {
        name: lotteryName,
        number: getNumberOfPeople(state)
      };
      state.newLottery = [];
      state.result = {};
    },
    clearList(state) {
      state.list = [];
    },
    clearPhotos(state) {
      state.photos = [];
    },
    clearResult(state) {
      state.result = {};
    },
    setClearStore(state) {
      state.config = {
        name: lotteryName,
        number: getNumberOfPeople()
      };
      state.result = {};
      state.newLottery = [];
      state.list = [];
      state.photos = [];
    },
    setConfig(state, config) {
      state.config = config;
      setData(configField, config);
    },
    setResult(state, result = {}) {
      state.result = result;

      setData(resultField, state.result);
    },
    setNewLottery(state, newLottery) {
      if (Array.isArray(newLottery)) {
        const filterNewLottery = newLottery.filter(
          data => !state.newLottery.some(lottery => lottery.name === data.name)
        );
        state.newLottery.push(...filterNewLottery);
      } else {
        const isExist = state.newLottery.some(
          item => item.name === newLottery.name
        );
        if (!isExist) state.newLottery.push(newLottery);
      }
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
