import { useNavigate } from "react-router-dom"

const Logo = ({ className, textSize = "text-2xl" }) => {
    const navigate = useNavigate();
    return (
        <div className={className} onClick={() => navigate("/")}>
            <div className={` ${textSize} font-bold p-2 text-black flex items-center`}>
                chat
                <div className="relative mx-1 flex flex-col items-center">
                    <div className="w-2 h-5 bg-yellow-500 animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-500 absolute -top-3"></div>
                </div>
                t
            </div>

        </div>
    )
}

export default Logo
