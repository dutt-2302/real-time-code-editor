import { Toaster } from 'react-hot-toast';
import './App.css';
import Home from './Components/Home';
import EditorPage from './Components/EditorPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 1000,
          success: {
            theme: {
              primary: '#4aed88'
            }
          }
        }}
      />

      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/editor/:roomId' element={<EditorPage />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
