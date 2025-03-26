const InitalLoader = ({ content }) => {
    return (
        <div className=' border-2 border-black absolute w-full h-full z-10 flex flex-col justify-center items-center space-y-3 bg-white/100'>
            <div className=' text-center'>
                <p className='text-2xl sm:text-3xl md:text-4xl font-bold text-black tracking-wider'>
                    Chat<span className="font-bold mx-1 text-yellow-500 text-3xl sm:text-4xl md:text-5xl">I</span>t
                </p>
                <p className='text-gray-700 text-sm sm:text-base md:text-lg tracking-wider mt-2'>
                    {content}   
                </p>
            </div>

            <div className='flex space-x-1 items-center'>
                <span className='text-lg font-semibold tracking-wider'>Loading</span>
                <span className="dot animate-flash"></span>
                <span className="dot animate-flash delay-200"></span>
                <span className="dot animate-flash delay-400"></span>
            </div>
        </div>
    )
}

export default InitalLoader;
