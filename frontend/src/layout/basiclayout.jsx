import Footer from "../components/Footer"
import Navbar from "../components/navbar"

const BasicLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 w-full mt-16">
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default BasicLayout
