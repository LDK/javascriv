// index.tsx
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { generateGoogleFontsLink } from './Editor/EditorFonts';

const googleFontsLink = generateGoogleFontsLink();
const linkElement = document.createElement('link');
linkElement.href = googleFontsLink;
linkElement.rel = 'stylesheet';
linkElement.type = 'text/css';

document.head.appendChild(linkElement);

// fetch(googleFontsLink)
//   .then((response) => response.text())
//   .then((css) => {
//     const style = document.createElement('style');
//     style.textContent = css;
//     document.head.appendChild(style);
//   });
  
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
