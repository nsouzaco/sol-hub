import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { MoralisProvider } from "react-moralis";

ReactDOM.render(
  <React.StrictMode>
      <MoralisProvider appId="8VkXjJ17XBxfwbpKyj9c7uG0B2KzEuBL4TjV2mAf" serverUrl="https://4bioduqkhy6z.usemoralis.com:2053/server">
    <App />
  </MoralisProvider>,
  </React.StrictMode>,
  document.getElementById('root')
);
