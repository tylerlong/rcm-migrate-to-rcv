import '../index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import {Form, Button, Input, Divider} from 'antd';

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 8},
};
const tailLayout = {
  wrapperCol: {offset: 8, span: 8},
};

const onFinish = (values: {adminEmail: string; keyFile: string}) => {
  const adminEmail = values.adminEmail;
  const keyFile = (document.getElementById('keyFile') as HTMLInputElement)
    .files![0];
  const reader = new FileReader();
  reader.onload = function (event) {
    const keyJson = JSON.parse(event.target!.result as string);
    const clientEmail = keyJson.client_email;
    const privateKey = keyJson.private_key;
    console.log(adminEmail, clientEmail, privateKey);
    (window.opener as Window).postMessage(
      {message: 'googleAuthorizeSuccess', adminEmail, clientEmail, privateKey},
      window.location.origin
    );
    window.close();
  };
  reader.readAsText(keyFile);
};

class App extends React.Component {
  render() {
    return (
      <>
        <h1>Authorize to access Google</h1>

        <Divider />

        <Form {...layout} initialValues={{remember: true}} onFinish={onFinish}>
          <Form.Item
            label="Admin email"
            name="adminEmail"
            rules={[
              {
                required: true,
                message: 'Please input admin email!',
              },
              {
                pattern: /^\S+@\S+$/,
                message: 'Please input valid email!',
              },
            ]}
            extra="Google G Suite admin email address"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Service Account key file"
            name="keyFile"
            rules={[
              {
                required: true,
                message: 'Please specify the key file!',
              },
              {
                pattern: /^.+?\.json$/,
                message: 'It must be a json file!',
              },
            ]}
            extra="Follow instructions below to configure and generate the key file"
          >
            <Input type="file" accept="application/json" id="keyFile" />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <h2>Instructions</h2>
        <p>
          Please follow instructions on{' '}
          <a href="https://developers.google.com/identity/protocols/oauth2/service-account">
            this page
          </a>{' '}
          to perform the following tasks:
        </p>
        <ul>
          <li>
            <a href="https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount">
              Creating a service account
            </a>
            <ul>
              <li>
                Do not forget to create a key and download the json key file and
                specify it in the form above.
              </li>
            </ul>
          </li>
          <li>
            <a href="https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority">
              Delegating domain-wide authority to the service account
            </a>
            <ul>
              <li>
                For OAuth scopes, please specify:
                <ul>
                  <li>https://www.googleapis.com/auth/admin.directory.user</li>
                  <li>https://www.googleapis.com/auth/calendar</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </>
    );
  }
}

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<App />, container);
