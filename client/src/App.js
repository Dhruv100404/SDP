
import './App.css';
import Home from './Components/Home';

import Main from './Components/Main';
import Error from './Components/Error';
import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <>
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Main />} />
        <Route path='*' element={<Error />} />
      </Routes>
    </>
  );
}

export default App;
