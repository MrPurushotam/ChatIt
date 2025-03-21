import FeedbackForm from "../components/review/reviewForm"

const Review = () => {
  return (
    <div className="w-full h-full flex flex-col py-5 px-3">
      <h2 className="text-center text-2xl font-medium tracking-wide py-5"> Feedback form/Report bug</h2>
      <div className="flex flex-1 items-center p-3">
        <FeedbackForm />
      </div>
    </div>
  )
}

export default Review
