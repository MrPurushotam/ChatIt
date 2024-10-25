
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SigninPage from './pages/Signin';
import { useRecoilState, useSetRecoilState } from "recoil";
import SocketWrapper from './utils/socketHandler';
import { authenticatedAtom, isUserConnectedToInternetAtom } from './states/atoms';
import { useEffect, useRef } from 'react';
import VerifyEmail from './pages/VerifyEmail';
import UpdateProfileOnce from './components/UpdateProfileOnce';
import { ProtectedRoute, UnProtectedRoute, UnVerifiedRoute, VerifiedRoute } from './components/Outlets';

const WorkerScript = () => new Worker(new URL('./WebWorkers/Worker-1.js', import.meta.url));

function App() {
  // variables for check internet connectivity
  const workerRef = useRef(null);
  const [isConnectedToInternet, setIsConnectedToInternet] = useRecoilState(isUserConnectedToInternetAtom);
  const isInitialRender = useRef(true);

  const setAuthenticated = useSetRecoilState(authenticatedAtom);
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  useEffect(() => {
    const authToken = getCookie('authenticate');
    setAuthenticated(authToken ? true : false);
  }, [setAuthenticated])

  // logic for whether user is connected to internet or not
  useEffect(() => {
    try {
      const worker = WorkerScript();

      // Message handler
      const handleMessage = (event) => {
        const { online } = event.data;
        setIsConnectedToInternet(online);
        isInitialRender.current = false;
      };

      // Error handling for worker
      worker.onerror = (error) => {
        console.error('Worker error:', error);
        setIsConnectedToInternet(false);
      };

      // Set message handler and reference to worker
      worker.onmessage = handleMessage;
      workerRef.current = worker;

      // Cleanup worker on component unmount
      return () => worker.terminate();
    } catch (error) {
      console.error('Failed to start worker:', error);
      setIsConnectedToInternet(navigator.onLine);
    }
  }, [setIsConnectedToInternet]);

  return (
    <BrowserRouter>
      <div className="w-full h-[100vh] ">
        {
          isInitialRender.current && !isConnectedToInternet &&
          <div className='z-20 absolute bg-white w-full h-full flex justify-center items-center flex-col space-y-2' role="alert">
            <pre className='text-lg'>You aren't connected to internet. Please connect to interent.</pre>
            <div className='w-1/2 h-auto aspect-[3/2] border-2 border-gray-300 rounded-md shadow-md overflow-hidden'>
              <img src="https://i.pinimg.com/originals/5a/65/ee/5a65ee278cd557143f05a4ba91abbfa8.gif" alt="animation" className='w-full aspect-[3/2] object-contain mx-auto' />
            </div>
          </div>
        }
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route element={<UnProtectedRoute />}>
            <Route path="/signin" element={<SigninPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>

            <Route element={<VerifiedRoute />}>
              <Route path="/dashboard" element={
                <SocketWrapper>
                  <Dashboard />
                </SocketWrapper>
              } />
            </Route>
            <Route element={<UnVerifiedRoute />}>
              <Route path="/verify/:email?" element={<VerifyEmail />} />
              <Route path="/profile" element={<UpdateProfileOnce />} />
            </Route>

          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
