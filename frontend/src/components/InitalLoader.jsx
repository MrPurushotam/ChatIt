import Logo from "./Logo";

const InitalLoader = ({ content }) => {
    return (
        <div className=' border-2 border-black absolute w-full h-full z-[110] flex flex-col justify-center items-center space-y-1 bg-white/100'>
            <div className='flex justify-center items-center flex-col'>
                <Logo className="-mb-2" size="3xl" />
                <p className='text-gray-700 text-sm sm:text-base md:text-lg tracking-wider'>
                    {content}   
                </p>
            </div>

            <div className='flex space-x-1 items-center'>
                <span className='text-lg font-medium tracking-wider'>Loading</span>
                <span className="dot animate-flash mt-1"></span>
                <span className="dot animate-flash delay-200 mt-1"></span>
                <span className="dot animate-flash delay-[400ms] mt-1"></span>
            </div>
        </div>
    )
}

export default InitalLoader;
