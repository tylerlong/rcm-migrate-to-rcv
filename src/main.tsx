import React from 'react';
import {Component} from 'react-subx';
import {Button, Divider, Steps, Tabs, Spin} from 'antd';

import {StoreType} from './store';

type PropsStore = {
  store: StoreType;
};

class App extends Component<PropsStore> {
  render() {
    const store = this.props.store;
    return (
      <>
        <h1>RCM to RCV migration tool</h1>
        <p>
          If you are an Office 365 admin or a Google G Suite admin, use this
          tool to update everybody&#39;s calendar to replace RCM with RCV.
        </p>

        <Divider />

        <Steps current={store.currentStep}>
          <Steps.Step title="Calendar Authorization" />
          <Steps.Step title="RingCentral Authorization" />
          <Steps.Step title="Migration to RCV" />
        </Steps>

        <Divider />

        {store.pending ? (
          <Spin size="large" className="middle-button" />
        ) : (
          [
            <CalendarAuthorization store={store} key="0" />,
            <RingCentralAuthorization store={store} key="1" />,
            <RcvMigration store={store} key="2" />,
          ][store.currentStep]
        )}
      </>
    );
  }
}

class CalendarAuthorization extends Component<PropsStore> {
  render() {
    const store = this.props.store;
    return (
      <Tabs>
        <Tabs.TabPane tab="Outlook Calendar" key="outlook">
          <Button
            onClick={() => store.loginMicrosoft()}
            type="primary"
            size="large"
          >
            Login as Office 365 admin
          </Button>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Google Calendar" key="google">
          <Button
            onClick={() => store.loginGoogle()}
            type="primary"
            size="large"
          >
            Login as G Suite admin
          </Button>
        </Tabs.TabPane>
      </Tabs>
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
        Login as RingCentral user
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
        Migrate RCM meetings to RCV meetings
      </Button>
    );
  }
}

export default App;
