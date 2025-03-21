import { useNavigate } from "react-router-dom"

const Logo = ({ className, size = "2xl" }) => {
    const navigate = useNavigate();

    const getSize = (size) => {
        switch (size) {
            case "xl":
                return { textSize: "text-xl", height: "h-4", width: "w-2" };
            case "lg":
                return { textSize: "text-lg", height: "h-3", width: "w-2" };
            case "md":
                return { textSize: "text-md", height: "h-2", width: "w-2" };
            case "sm":
                return { textSize: "text-sm", height: "h-1", width: "w-2" };
            case "2xl":
            default:
                return { textSize: "text-2xl", height: "h-5", width: "w-2" };
        }
    };

    const { textSize, height, width } = getSize(size);

    return (
        <div className={className} onClick={() => navigate("/")}>
            <div className={` ${textSize} font-bold p-2 text-black flex items-center`}>
                chat
                <div className="relative mx-1 flex flex-col items-center">
                    <div className={`${width} ${height} bg-yellow-500 animate-pulse`}></div>
                    <div className={`${width} h-2 bg-yellow-500 absolute -top-3`}></div>
                </div>
                <span>t</span>
            </div>
        </div>
    )
}

export default Logo
