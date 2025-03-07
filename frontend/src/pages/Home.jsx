import KeyFeatures from "../components/landing/keyFeatures";
import heroSvg from "../asset/hero-svg.svg";
import shape1 from "../asset/shape-1.svg";
import shape2 from "../asset/shape-2.svg";
import shape3 from "../asset/shape-3.svg";
import shape4 from "../asset/shape-4.svg";
import shape5 from "../asset/shape-5.svg";
import shape6 from "../asset/shape-6.svg";
import rightArrow from "../asset/right-arrow.png";
import getStartedBg from "../asset/get_started_bg_shape.svg";
import { useNavigate } from "react-router-dom";
import ZoomableImage from "../components/landing/zoomableImage";

const Home = () => {
  const navigate = useNavigate();
  const steps = [
    { id: 1, title: "Sign Up for ChatIt", description: "Join the community in seconds" },
    { id: 2, title: "Set Up Your Profile", description: "Personalize your experience" },
    { id: 3, title: "Explore Conversations", description: "Join chats and start connecting" },
    { id: 4, title: "Enjoy Seamless Messaging", description: "Experience real-time chat like never before" },
  ];
  return (
    <div className="w-full h-full flex flex-col">
      <section className="relative w-full min-h-dvh flex justify-center items-center" id="hero">
        <img src={heroSvg} alt="hero svg" className="absolute top-0 left-0 w-full h-full object-cover z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-[90vw] h-[80vh] bg-transparent backdrop-blur-md shadow-lg rounded-md p-2">

          <div className="w-full md:w-1/2 flex flex-col items-center justify-center h-full">

            <h1 className="text-black text-lg sm:text-xl md:text-2xl flex flex-row items-center font-mono font-light tracking-wide">
              Talk,Type,Connect
            </h1>
            <p className="text-black text-sm sm:text-base md:text-lg font-semibold tracking-wide mt-1 capitalize relative after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:w-0 after:h-[3px] after:bg-themeCyan after:animate-[underline-loop_3s_ease-in-out_infinite]">
              Bringing you closer, one message at a time!
            </p>

            <button className="mt-7 bg-gray-200 border-2 border-gray-800 text-gray-800 px-6 py-2 text-lg font-semibold rounded-lg shadow-[inset_-4px_-4px_0px_#ccc,4px_4px_0px_#333] cursor-pointer transition-all duration-300 ease-in-out hover:shadow-[inset_-2px_-2px_0px_#ccc,2px_2px_0px_#333] active:bg-black active:border-gray-200 active:text-gray-200 active:shadow-none animate-bounce " onClick={() => navigate("/signin")}>
              Get Started!
            </button>

          </div>

          <div className="w-full md:w-1/2 flex items-center justify-center h-full relative">
            <ZoomableImage src="./sample2.webp" alt="primary dashboard ui"
              className={"w-[100%] md:w-[170%] rounded-lg border-[5px] border-white transform hover:scale-105 transition-all duration-500 ease-in-out animate-[floatAnimation_5s_ease-in-out_infinite] shadow-[0px_0px_15px_5px_rgba(0,255,255,0.5)] rotate-[-5deg]"}
            />
            {/* <img
              src="./sample2.webp"
              alt="primary dashboard ui"
              className="w-[100%] md:w-[170%] rounded-lg border-[5px] border-white transform hover:scale-105 transition-all duration-500 ease-in-out animate-[floatAnimation_5s_ease-in-out_infinite] shadow-[0px_0px_15px_5px_rgba(0,255,255,0.5)] rotate-[-5deg]"
            /> */}
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="w-full h-auto flex items-center justify-center bg-[#F1F3F5] p-2" id="features">
        <div className="text-center text-black w-11/12 md:w-8/12  h-auto px-2 py-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 my-7">Key Features</h2>
          <div className="mx-auto w-full max-w-[950px] h-full flex flex-wrap justify-center  px-4 pt-5 pb-12 gap-3">
            {/* Content for the first div */}
            <KeyFeatures title={"Intuitive Design"} description={"Modern, responsive interface for effortless communication."} shapeUrl={shape1}>
              <i className="ph-duotone ph-layout text-4xl"></i>
            </KeyFeatures>
            <KeyFeatures title={"Smart File Sharing"} description={"Share images, videos, PDFs, and more with drag & drop simplicity."} shapeUrl={shape4}>
              <i className="ph-duotone ph-file-arrow-up text-4xl"></i>
            </KeyFeatures>
            <KeyFeatures title={"Live Interaction Signals"} description={"See typing indicators, online status, and message read receipts."} shapeUrl={shape3}>
              <i className="ph-duotone ph-cell-signal-high text-4xl"></i>
            </KeyFeatures>
            <KeyFeatures title={"Personalized Profiles"} description={"Customize your display name, photo, and about section."} shapeUrl={shape2}>
              <i className="ph-duotone ph-user-circle-gear text-4xl"></i>
            </KeyFeatures>
            <KeyFeatures title={"Effortless Security"} description={"Quick email verification and password recovery."} shapeUrl={shape5}>
              <i className="ph-duotone ph-shield-chevron text-4xl"></i>
            </KeyFeatures>
            <KeyFeatures title={"Find & Chat Instantly"} description={"Search users and start conversations seamlessly."} shapeUrl={shape6}>
              <i className="ph-duotone ph-binoculars text-4xl"></i>
            </KeyFeatures>
          </div>
        </div>
      </section>

      <section className="relative w-full min-h-screen flex items-center justify-center bg-[#E5E5E5]" id="getstarted">
        <img src={getStartedBg} alt="background shape" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="relative flex flex-col items-center w-11/12 md:w-10/12 z-10">

          <div className="text-center my-7">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide">How to Get Started?</h1>
            <h4 className="text-base md:text-lg tracking-wide font-semibold text-gray-700">
              Follow these simple steps to get started!
            </h4>
          </div>

          <div className="isolate relative flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 md:gap-12 my-7">
            {steps.map((step, index) => (
              <div key={step.id} className="relative group flex flex-col items-center">

                {/* Vertical Arrows (Mobile) */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-3 block sm:hidden">
                    <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 0 V30" stroke="black" strokeWidth="3" strokeLinecap="round" />
                      <path d="M5 25 L15 35 L25 25" stroke="black" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                {/* Horizontal Arrows (Desktop) */}
                {index !== steps.length - 1 && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-[-30px] md:right-[-50px] hidden sm:block">
                    <img src={rightArrow} alt="right-arrow" className="ml-10 " />
                    {/* <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 10 H30" stroke="black" strokeWidth="3" strokeLinecap="round" />
                      <path d="M25 3 L35 10 L25 17" stroke="black" strokeWidth="3" strokeLinecap="round" />
                    </svg> */}
                  </div>
                )}

                {/* Step Card */}
                <div
                  className={`w-48 md:w-64 h-28 md:h-36 bg-gradient-to-r from-[#f46b45] to-[#eea849] text-gray-900 flex flex-col items-center justify-center rounded-md shadow-lg p-4 cursor-pointer transition-transform duration-300 ease-in-out transform
            ${index % 2 === 0 ? "rotate-[-6deg]" : "rotate-[6deg]"}
            group-hover:rotate-0`}
                >
                  <h2 className="text-lg md:text-xl font-bold text-black">{step.id}</h2>
                  <h3 className="font-semibold text-sm md:text-base text-center">{step.title}</h3>
                  <p className="text-xs md:text-sm opacity-80 text-neutral-800 text-center">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
      <section className="w-full" id="description">

      </section> */}

    </div>
  )
}

export default Home
