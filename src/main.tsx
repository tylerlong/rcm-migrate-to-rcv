import React from 'react';
import {Component} from 'react-subx';
import {Button, Divider, Steps} from 'antd';

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

        <Steps current={store.currentStep}>
          <Steps.Step title="Calendar Authorization" />
          <Steps.Step title="RingCentral Authorization" />
          <Steps.Step title="Migrate to RCV" />
        </Steps>

        <Divider />

        {
          [
            <CalendarAuthorization store={store} key="0" />,
            <RingCentralAuthorization store={store} key="1" />,
            <RcvMigration store={store} key="2" />,
          ][store.currentStep]
        }
      </>
    );
  }
}

class CalendarAuthorization extends Component<PropsStore> {
  render() {
    const store = this.props.store;
    return (
      <Button
        onClick={() => store.loginMicrosoft()}
        type="primary"
        size="large"
      >
        Authorize this app to access your Outlook Calendar
      </Button>
    );
  }
}

class RingCentralAuthorization extends Component<PropsStore> {
  render() {
    const store = this.props.store;
    return (
      <Button
        onClick={() => store.loginRingCentral()}
        type="primary"
        size="large"
        className="middle-button"
      >
        Authorize this app to access your RCV account.
      </Button>
    );
  }
}

class RcvMigration extends Component<PropsStore> {
  render() {
    const store = this.props.store;
    return store.done ? (
      <Button onClick={() => store.restart()} block size="large">
        Restart the migration wizard
      </Button>
    ) : (
      <Button
        onClick={() => store.migrate()}
        type="primary"
        size="large"
        className="right-button"
      >
        Migrate your RCM meetings to RCV meetings
      </Button>
    );
  }
}

export default App;
