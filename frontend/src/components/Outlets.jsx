import { Outlet, Navigate } from "react-router-dom";
import useLoggedUser from "../Hooks/useLoggedUser";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { loggedUserAtom } from "../states/atoms";
import Loader from "./Loader";

export const ProtectedRoute = () => {
  let tokenExists = window.localStorage.getItem('token');
  return (
    <>
      {tokenExists ? <Outlet /> : <Navigate to="/signin" />}
    </>
  )
}
export const UnProtectedRoute = () => {
  let tokenExists = window.localStorage.getItem('token');
  return (
    <>
      {!tokenExists ? <Outlet /> : <Navigate to="/dashboard" />}
    </>
  )
}

export const UnVerifiedRoute=()=>{
  const loggedUser = useLoggedUser();
  const user = useRecoilValue(loggedUserAtom);
  const [loading , setLoading]=useState(true);
  useEffect(()=>{
    if(!!user){
      setLoading(false);
    }
  },[user])

  if (loading) {
    return null;
  }
  return (
    <>
      {!user?.isVerified ? <Outlet /> : <Navigate to={`/dashboard`} />}
    </>
  )
}

export const VerifiedRoute = () => {
  const loggedUser = useLoggedUser();
  const user = useRecoilValue(loggedUserAtom);
  const [loading , setLoading]=useState(true);
  useEffect(()=>{
    if(!!user){
      setLoading(false);
    }
  },[user])

  if (loading) {
    return null;
  }
  return (
    <>
      {user?.isVerified ? <Outlet /> : <Navigate to={`/verify/${user.email}`} />}
    </>
  )
}
