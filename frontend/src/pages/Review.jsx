import Footer from "../components/Footer"
import Navbar from "../components/navbar"
import FeedbackForm from "../components/review/reviewForm"

const Review = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center">
        <FeedbackForm />
      </div>
      <Footer />
    </div>
  )
}

export default Review
