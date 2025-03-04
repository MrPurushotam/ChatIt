import KeyFeatures from "../components/landing/keyFeatures";
import Logo from "../components/Logo";
import Navbar from "../components/navbar";
import heroSvg from "../asset/hero-svg.svg";
import shape1 from "../asset/shape-1.svg";
import shape2 from "../asset/shape-2.svg";
import shape3 from "../asset/shape-3.svg";
import shape4 from "../asset/shape-4.svg";
import shape5 from "../asset/shape-5.svg";
import shape6 from "../asset/shape-6.svg";
import getStartedBg from "../asset/get_started_bg_shape.svg";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const Home = () => {
  const steps = [
    { id: 1, title: "Sign Up for ChatIt", description: "Join the community in seconds" },
    { id: 2, title: "Set Up Your Profile", description: "Personalize your experience" },
    { id: 3, title: "Explore Conversations", description: "Join chats and start connecting" },
    { id: 4, title: "Enjoy Seamless Messaging", description: "Experience real-time chat like never before" },
  ];
  return (
    <d className="w-full h-full flex flex-col">
      <Navbar />

      <section className="relative w-full min-h-dvh flex justify-center items-center" id="hero">
        <img src={heroSvg} alt="hero svg" className="absolute top-0 left-0 w-full h-full object-cover z-0" />

        <div className="relative z-10 flex flex-row items-center justify-center w-[90vw] h-[80vh] bg-transparent backdrop-blur-md shadow-lg rounded-md p-2">

          <div className="w-1/2 flex flex-col items-center justify-center h-full">
            <h1 className="text-black text-4xl flex flex-row items-center">Welcome to <Logo className={"bg-white flex items-center"} textSize="text-3xl" /></h1>
            <p className="text-black text-lg font-bold mt-1 capitalize relative after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:w-0 after:h-[3px] after:bg-themeCyan after:animate-[underline-loop_3s_ease-in-out_infinite]">
              Just Chat It Out
            </p>
            <p className="text-black mt-4">Connect with your friends and family</p>
          </div>

          <div className="w-1/2 flex items-center justify-center h-full relative">
            <img
              src="./sample2.webp"
              alt="primary dashboard ui"
              className="w-[170%] rounded-lg border-[5px] border-white transform hover:scale-105 transition-all duration-500 ease-in-out animate-[floatAnimation_5s_ease-in-out_infinite] shadow-[0px_0px_15px_5px_rgba(0,255,255,0.5)] rotate-[-5deg]"
            />
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="w-full min-h-screen flex items-center justify-center bg-[#F1F3F5]" id="features">
        <div className="text-center text-black w-8/12 h-4/5 shadow-md shadow-red-500 px-2 py-4 overflow-hidden">
          <h2 className="text-3xl font-bold text-gray-900 my-7">Key Features</h2>
          <div className="mx-auto w-9/12 h-full flex flex-wrap justify-between overflow-auto px-4 py-5 gap-3">
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

      {/* How to get started page */}
      <section className="relative w-full min-h-screen flex items-center justify-center bg-[#E5E5E5]" id="getstarted">
        <img src={getStartedBg} alt="background shape" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="relative flex flex-col items-center w-10/12 z-10">

          {/* Header */}
          <div className="text-center my-7">
            <h1 className="text-3xl font-bold tracking-wide">How to Get Started?</h1>
            <h4 className="text-lg tracking-wide font-semibold text-gray-700">
              Follow these simple steps to get started!
            </h4>
          </div>

          {/* Steps Container */}
          <div className="relative flex flex-wrap justify-center items-center gap-12 my-7">
            {steps.map((step, index) => (
              <div key={step.id} className="relative group">
                {/* Arrow (Except Last Item) */}
                {index !== steps.length - 1 && (
                  <div className="absolute right-[-30px] top-1/2 transform -translate-y-1/2 hidden md:block">
                    <svg width="50" height="20" viewBox="0 0 50 20" fill="none">
                      <path d="M0 10 L40 10 M30 5 L40 10 L30 15" stroke="black" strokeWidth="2" strokeDasharray="5,5" />
                    </svg>
                  </div>
                )}

                {/* Rotating Card */}
                <div
                  className={`w-64 h-36 bg-gradient-to-r from-[#f46b45] to-[#eea849] text-gray-900 flex flex-col items-center justify-center rounded-md shadow-lg p-4 cursor-pointer transition-transform duration-300 ease-in-out transform
                ${index % 2 === 0 ? "rotate-[-6deg]" : "rotate-[6deg]"}
                group-hover:rotate-0`}
                >
                  <h2 className="text-xl font-bold text-black">{step.id}</h2>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm opacity-80 text-neutral-800">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 
      <section className="w-full" id="description">

      </section> */}

      <Footer />

    </d>
  )
}

export default Home
