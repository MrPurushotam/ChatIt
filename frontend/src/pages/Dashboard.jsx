import ChatInterface from "../components/ChatInterface";
import { useRecoilValue } from "recoil";
import { activeChatAtom, isConnectedAtom } from "../states/atoms";
import Sidebar from "../components/Sidebar";
import InitalLoader from "../components/InitalLoader";
import ViewImage from "../components/ViewImage";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
// THOUGHT: I am thinking to add a temp page or loader just like whatsapp which will run untill chats are fetched , chatList is fetched & socket is connected successfully. Post that the chat window shoudl appear any error while fetching or connnecting any thing then it shall stop and logout! 

const Dashboard = ({ socket, loggedUser, fetchChats, hasMoreChats }) => {
  const currentTextingUser = useRecoilValue(activeChatAtom);
  const isConnected = useRecoilValue(isConnectedAtom);
  return (
    <>
      {isConnected === 'inital-connect' &&
        <InitalLoader content="Please wait web is loading." />
      }
      <div className="w-full h-full flex flex-col justify-center items-center md:hidden">
        <Logo />
        <span className="font-mono text-lg text-wrap w-3/5 text-center">Hey please switch to desktop mode. We don't want to spoil your experience Hehe😅</span>
        <Link
          to="/"
          className="relative px-4 py-1 font-semibold text-blue-600 group"
        >
          Home
          <span className="absolute left-0 bottom-0 w-full h-1 bg-themeOrangeDarker 
                   transform -skew-x-12 transition-all duration-300 scale-0 
                   group-hover:scale-100 group-hover:skew-x-0">
          </span>
        </Link>
      </div >

      <div className="flex justify-center w-full h-screen bg-gray-200">
        <div className="w-full sm:w-full md:w-full lg:w-[1500px] h-full bg-white border-x-2 border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-[4fr_9fr] h-full">
            <div className={`hidden sm:block ${currentTextingUser ? 'hidden md:block' : 'block'} overflow-hidden`}>
              <Sidebar fetchChats={fetchChats} hasMoreChats={hasMoreChats} />
            </div>
            <div className=" static h-full border-l-2 border-gray-300">
              {
                currentTextingUser ?
                  <ChatInterface socket={socket} loggedUser={loggedUser} />
                  :
                  <div className="flex items-center justify-center h-full w-full p-4 text-center">
                    <p className="text-lg md:text-xl font-mono font-light tracking-tighter">Chatit chat here at your own risk.</p>
                  </div>
              }
            </div>
          </div>
          <ViewImage />
        </div>
      </div>
    </>
  )
}

export default Dashboard
