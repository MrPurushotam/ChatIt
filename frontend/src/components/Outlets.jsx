import { Outlet, Navigate } from "react-router-dom";
import useLoggedUser from "../Hooks/useLoggedUser";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { loggedUserAtom } from "../states/atoms";
import Loader from "./Loader";

export const ProtectedRoute = () => {
  let cookieExists = document.cookie.includes("authenticate")
  return (
    <>
      {cookieExists ? <Outlet /> : <Navigate to="/signin" />}
    </>
  )
}
export const UnProtectedRoute = () => {
  let cookieExists = document.cookie.includes("authenticate")
  return (
    <>
      {!cookieExists ? <Outlet /> : <Navigate to="/dashboard" />}
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
    return 
    <div className="p-10">
      Please Wait its loading.
      <Loader className="flex h-full w-full absolute items-center justify-center bg-[#ee6145]/30"/>;
    </div>
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
    return 
    <div className="p-10">
      Please Wait its loading.
      <Loader className="flex h-full w-full absolute items-center justify-center bg-[#ee6145]/30"/>;
    </div>
  }
  return (
    <>
      {user?.isVerified ? <Outlet /> : <Navigate to={`/verify/${user.email}`} />}
    </>
  )
}
