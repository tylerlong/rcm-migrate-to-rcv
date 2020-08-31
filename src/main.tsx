import React from 'react';
import {Component} from 'react-subx';
import {Button} from 'antd';

import {StoreType} from './store';

type PropsStore = {
  store: StoreType;
};
class App extends Component<PropsStore> {
  render() {
    const store = this.props.store;
    return (
      <>
        <h1>RCM migrate to RCV</h1>
        <h2>Step #1</h2>
        <Button onClick={() => store.login()} type="primary">
          Authorize this app to access your Outlook Calendar
        </Button>
      </>
    );
  }
}

export default App;
