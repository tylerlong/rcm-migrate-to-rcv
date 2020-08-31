import SubX from 'subx';

export type StoreType = {
  ready: boolean;
  init: Function;
  load: Function;
};

const store = SubX.proxy<StoreType>({
  ready: false,
  init() {},
  load() {},
});

export default store;
