import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home';
import SigninPage from './pages/Signin';
import { useRecoilState, useSetRecoilState } from "recoil";
import SocketWrapper from './utils/socketHandler';
import { authenticatedAtom, isUserConnectedToInternetAtom } from './states/atoms';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ProtectedRoute, UnProtectedRoute, UnVerifiedRoute, VerifiedRoute } from './components/Outlets';
import Loader from './components/Loader';
import Dashboard from './pages/Dashboard';
import AboutDev from './pages/AboutDev';
import Review from './pages/Review';
import NotFound from './pages/NotFound';
import BasicLayout from './layout/basiclayout';
import PrivacyPolicy from './pages/privacy';
// import AboutDev from './Beta-Pages/BetaAbout';

const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const UpdateProfileOnce = lazy(() => import('./components/UpdateProfileOnce'));

const WorkerScript = () => new Worker(new URL('./WebWorkers/Worker-1.js', import.meta.url));
// Create a navigation guard component to prevent redirect loops
const NavigationGuard = ({ children }) => {
  const [lastNavigation, setLastNavigation] = useState(null);
  const location = useLocation();
  const timeoutRef = useRef(null);

  useEffect(() => {
    // If we've recently navigated to this path, don't trigger another navigation
    if (lastNavigation && lastNavigation.path === location.pathname &&
      Date.now() - lastNavigation.time < 2000) {
      return;
    }

    // Record this navigation
    setLastNavigation({ path: location.pathname, time: Date.now() });

    // Clear the timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset the navigation guard after 2 seconds
    timeoutRef.current = setTimeout(() => {
      setLastNavigation(null);
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, lastNavigation]);

  return children;
};

function App() {
  const workerRef = useRef(null);
  const [isConnectedToInternet, setIsConnectedToInternet] = useRecoilState(isUserConnectedToInternetAtom);
  const isInitialRender = useRef(true);

  const setAuthenticated = useSetRecoilState(authenticatedAtom);

  useEffect(() => {
    const authToken = window.localStorage.getItem("token");
    setAuthenticated(authToken ? true : false);
  }, [setAuthenticated])

  useEffect(() => {
    try {
      const worker = WorkerScript();
      const handleMessage = (event) => {
        const { online } = event.data;
        setIsConnectedToInternet(online);
        isInitialRender.current = false;
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
        setIsConnectedToInternet(false);
      };

      worker.onmessage = handleMessage;
      workerRef.current = worker;

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
          <NavigationGuard>
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

              {/* <Route path="/test" element={<AboutDev />} /> */}

              <Route element={<UnProtectedRoute />}>
                <Route path="/signin" element={<BasicLayout><SigninPage /></BasicLayout>} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<VerifiedRoute />}>
                  <Route path="/profile" element={<UpdateProfileOnce />} />
                  <Route path="/dashboard" element={
                    <SocketWrapper>
                      <Dashboard />
                    </SocketWrapper>
                  } />
                </Route>
                <Route element={<UnVerifiedRoute />}>
                  <Route path="/verify/:email?" element={<VerifyEmail />} />
                </Route>
              </Route>

            </Routes>
          </NavigationGuard>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

export default App
