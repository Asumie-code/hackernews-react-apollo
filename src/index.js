import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import {setContext} from '@apollo/client/link/context'
import { 
  ApolloProvider,
  ApolloClient, 
  createHttpLink, 
  InMemoryCache
  

} from '@apollo/client';

import { BrowserRouter } from 'react-router-dom';
import { AUTH_TOKEN } from './constants';


import { split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities';




const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
})

const authLink = setContext((_, {headers}) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  return {
    headers: {
      ...headers, 
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})



const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`, 
  options: {
    reconnect: true, 
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN)
    }
  }
})


const link = split(
  ({ query }) => {
    const {kind , operation} = getMainDefinition(query)
    return (
      kind === 'OperationDefinition' && 
      operation === 'subscription'
    )
  }, 
  wsLink, 
  authLink.concat(httpLink)
)







const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache()
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ApolloProvider>
  
  </BrowserRouter>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
