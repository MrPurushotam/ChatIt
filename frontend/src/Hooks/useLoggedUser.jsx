import { useEffect } from 'react';
import { useRecoilState, useRecoilValueLoadable } from 'recoil';
import { fetchUserDetailSelector, loggedUserAtom } from '../states/atoms';
import { useLogout } from './useLogout';

const useLoggedUser = () => {
  const [loggedUser, setLoggedUser] = useRecoilState(loggedUserAtom);
  const userDetailsLoadable = useRecoilValueLoadable(fetchUserDetailSelector);
  const logout = useLogout();
  useEffect(() => {
    if (userDetailsLoadable.state === 'hasValue') {
      setLoggedUser(userDetailsLoadable.contents);
    } else if (userDetailsLoadable.state === 'hasError') {
      console.error('Error loading user details:', userDetailsLoadable.contents);
      setLoggedUser(null);
    }
    else if(userDetailsLoadable.state==="Jwt Expired"){
      logout();
    }
  }, [userDetailsLoadable, setLoggedUser]);

  return loggedUser;
};

export default useLoggedUser;
