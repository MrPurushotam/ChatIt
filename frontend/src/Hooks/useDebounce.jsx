import { useRef } from 'react'

const useDebounce = (func, delay=0) => {
    const debounceTimerRef = useRef(null);
    return (...args) => {
        if(debounceTimerRef.current){
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current=setTimeout(()=>{
            func(...args);
        },delay);
    }
}

export default useDebounce
