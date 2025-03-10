const KeyFeatures = ({ title, description, children, shapeUrl }) => {
    return (
        <div className="w-40 md:w-52 h-40 md:h-52 rounded-md shadow-sm shadow-themeOrange p-1 bg-[#E5E5E5]">
            <div className="w-full h-full flex justify-center flex-col gap-1 p-2">
                <div className="relative flex justify-center items-center w-32 md:w-48 h-32 md:h-48 mx-auto">
                    <img
                        src={shapeUrl}
                        alt="shape"
                        className="absolute inset-0 w-full h-full opacity-70 pl-3"
                    />
                    {/* Icon */}
                    <div className="relative">{children}</div>
                </div>

                {/* Title and Description */}
                <span className="font-bold text-base md:text-lg tracking-tight w-full">{title }</span>
                <p className="text-xs md:text-sm tracking-wide font-semibold break-words">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default KeyFeatures;
