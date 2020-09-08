import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  render() {
    return 'Google';
  }
}

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<App />, container);
