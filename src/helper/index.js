export function setData(key, value) {
  if (typeof value === 'string') {
    return localStorage.setItem(key, value);
  }
  try {
    //debugger
    // TODO: how to keep up data set
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    return err;
  }
}

export function getData(key) {
  const value = localStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
}

export function removeData(key) {
  return localStorage.removeItem(key);
}

export function clearData() {
  return localStorage.clear();
}

export function getDomData(element, dataName) {
  if (!element || !dataName || !element.getAttribute) {
    return;
  }
  return element.getAttribute('data-' + dataName);
}

export const configField = 'config'; // 配置數據 (?)
export const resultField = 'result'; // 抽獎結果
export const newLotteryField = 'newLottery'; // 新增獎項
export const listField = 'list'; // 名單
export function conversionCategoryName(key) {
  let name = '';
  const newLottery = getData(newLotteryField) || [];
  const findres = newLottery.find(item => item.key === key);
  if (findres) {
    name = findres.name;
  }
  return name;
}
export const getNumberOfPeople = state => {
  return state && state.list.length > 0 ? state.list.length : 99;
};
export const updateNumberOfPeople = state => {
  if (state && state.list.length > 0) {
    state.config.number = state.list.length;
    return state.list.length;
  } else {
    return 99;
  }
};
