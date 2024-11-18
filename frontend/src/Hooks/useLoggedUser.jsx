import { useEffect } from 'react';
import { useRecoilState, useRecoilValueLoadable } from 'recoil';
import { fetchUserDetailSelector, loggedUserAtom } from '../states/atoms';
import { useLogout } from './useLogout';
import { useNavigate } from 'react-router-dom';

const useLoggedUser = () => {
  const [loggedUser, setLoggedUser] = useRecoilState(loggedUserAtom);
  const userDetailsLoadable = useRecoilValueLoadable(fetchUserDetailSelector);
  const navigate = useNavigate();
  // const logout = useLogout();  // it doesn't makes sense to be here because if jwt is expired then how will logout function ? logout sends a backend request which clears the cookies but for the time being i am not using cookie based auth due to domain conflict. For the time being i am using token based auth.
  useEffect(() => {
    if (userDetailsLoadable.state === 'hasValue') {
      setLoggedUser(userDetailsLoadable.contents);
    } else if (userDetailsLoadable.state === 'hasError') {
      console.error('Error loading user details:', userDetailsLoadable.contents);
      setLoggedUser(null);
    }
    else if(userDetailsLoadable.state==="Jwt Expired"){
      window.localStorage.clear("token");
      navigate("/signin")
    }
  }, [userDetailsLoadable, setLoggedUser]);

  return loggedUser;
};

export default useLoggedUser;
