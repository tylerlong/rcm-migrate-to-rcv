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
        <p>
          If there are lots of RCM meetings in your Outlook Calendar, use this
          tool to migrate them to RCV meetings.
        </p>

        <Divider />

        <h2>Step #1</h2>
        <Button onClick={() => store.loginMicrosoft()} type="primary">
          Authorize this app to access your Outlook Calendar
        </Button>

        <Divider />

        <h2>Step #2</h2>
        <Button onClick={() => store.loginRingCentral()} type="primary">
          Authorize this app to access your RCV account.
        </Button>

        <Divider />

        <h2>Step #3</h2>
        <Button onClick={() => store.migrate()} type="primary">
          Migrate your RCM meetings to RCV meetings
        </Button>
      </>
    );
  }
}

export default App;
