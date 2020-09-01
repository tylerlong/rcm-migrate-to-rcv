import React from 'react';
import {Component} from 'react-subx';
import {Button, Divider} from 'antd';

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

        <Divider />

        <h2>Step #1</h2>
        <Button onClick={() => store.login()} type="primary">
          Authorize this app to access your Outlook Calendar
        </Button>

        <Divider />

        <h2>Step #2</h2>
        <Button onClick={() => store.migrate()} type="primary">
          Migrate your RCM meetings to RCV meetings
        </Button>
      </>
    );
  }
}

export default App;
