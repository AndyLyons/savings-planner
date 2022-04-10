import React from 'react';
import Div100vh from 'react-div-100vh';
import ReactDOM from 'react-dom';
import { App } from './components/App';

ReactDOM.render(
  <React.StrictMode>
    <Div100vh>
      <App />
    </Div100vh>
  </React.StrictMode>,
  document.getElementById('root')
);
