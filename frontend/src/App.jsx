
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import SigninPage from './pages/Signin';
import { useRecoilState, useSetRecoilState } from "recoil";
import SocketWrapper from './utils/socketHandler';
import { authenticatedAtom, isUserConnectedToInternetAtom } from './states/atoms';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { ProtectedRoute, UnProtectedRoute, UnVerifiedRoute, VerifiedRoute } from './components/Outlets';
import Loader from './components/Loader';
import AboutDev from './pages/AboutDev';
import Review from './pages/Review';
import NotFound from './pages/NotFound';
import BasicLayout from './layout/basiclayout';
import PrivacyPolicy from './pages/privacy';
// import BetaSignin from './Beta-Pages/signin';
// import BetaUpdateProfileOnce from './Beta-Pages/UpdateProfileOnce';

// dynamic Routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const UpdateProfileOnce = lazy(() => import('./components/UpdateProfileOnce'));


const WorkerScript = () => new Worker(new URL('./WebWorkers/Worker-1.js', import.meta.url));

function App() {
  // variables for check internet connectivity
  const workerRef = useRef(null);
  const [isConnectedToInternet, setIsConnectedToInternet] = useRecoilState(isUserConnectedToInternetAtom);
  const isInitialRender = useRef(true);

  const setAuthenticated = useSetRecoilState(authenticatedAtom);

  useEffect(() => {
    const authToken = window.localStorage.getItem("token");
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
      <div className="w-full h-[100vh]">
        {
          isInitialRender.current && !isConnectedToInternet &&
          <div className='z-20 absolute bg-white w-full h-full flex justify-center items-center flex-col space-y-2' role="alert">
            <pre className='text-lg'>You are not connected to internet. Please connect to interent.</pre>
            <div className='w-1/2 h-auto aspect-[3/2] border-2 border-gray-300 rounded-md shadow-md overflow-hidden'>
              <img src="https://i.pinimg.com/originals/5a/65/ee/5a65ee278cd557143f05a4ba91abbfa8.gif" alt="animation" className='w-full aspect-[3/2] object-contain mx-auto' />
            </div>
          </div>
        }
        <Suspense fallback={<Loader className="absolute top-[50%] left-[50%] " />}>
          <Routes>
            <Route index path="/" element={<BasicLayout><Home /></BasicLayout>} />
            <Route index path="/aboutdev" element={<BasicLayout><AboutDev /></BasicLayout>} />
            <Route index path="/review" element={<BasicLayout><Review /></BasicLayout>} />
            <Route index path="/privacypolicy" element={<BasicLayout><PrivacyPolicy /></BasicLayout>} />
            <Route index path="/*" element={<BasicLayout><NotFound /></BasicLayout>} />

            {/* beta ui changes to be looked at later stage */}
            {/* <Route path="/test" element={<BetaSignin />} />
            <Route path="/test2" element={<VerifyEmail />} />
            <Route path="/test3" element={<BetaUpdateProfileOnce />} /> */}


            <Route element={<UnProtectedRoute />}>
              <Route path="/signin" element={<BasicLayout><SigninPage /></BasicLayout>} />
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
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

export default App
