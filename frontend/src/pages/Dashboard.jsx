import ChatInterface from "../components/ChatInterface";
import { useRecoilState, useRecoilValue } from "recoil";
import { activeChatAtom, isConnectedAtom, viewImageAtom } from "../states/atoms";
import Sidebar from "../components/Sidebar";
import InitalLoader from "../components/InitalLoader";
// THOUGHT: I am thinking to add a temp page or loader just like whatsapp which will run untill chats are fetched , chatList is fetched & socket is connected successfully. Post that the chat window shoudl appear any error while fetching or connnecting any thing then it shall stop and logout! 

const Dashboard = ({ socket, loggedUser }) => {
  const currentTextingUser = useRecoilValue(activeChatAtom);
  const [viewImage, setViewImage] = useRecoilState(viewImageAtom)
  const isConnected = useRecoilValue(isConnectedAtom);
  return (
    <>
      {isConnected === 'inital-connect' &&
        <InitalLoader content="Please wait web is loading." />
      }

      <div className="flex justify-center w-full h-screen bg-gray-200">
        <div className="w-full sm:w-full md:w-full lg:w-[1500px] h-full bg-white border-x-2 border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-[4fr_9fr] h-full">
            <div className={`hidden sm:block ${currentTextingUser ? 'hidden md:block' : 'block'} overflow-hidden`}>
              <Sidebar />
            </div>
            <div className=" static h-full border-l-2 border-gray-300">
              {
                currentTextingUser ?
                  <ChatInterface socket={socket} loggedUser={loggedUser} />
                  :
                  <div className="flex items-center justify-center h-full w-full p-4 text-center">
                    <p className="text-lg md:text-xl">ChatIt chat here at your own risk</p>
                  </div>
              }
            </div>
          </div>
          {viewImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setViewImage(null)}
            >
              <div className="relative max-w-[60vw] max-h-[60vh]" onClick={(e) => e.stopPropagation()}>
                <div
                  className="relative w-full max-w-[90vw] md:max-w-[60vw] h-auto max-h-[90vh] md:max-h-[60vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={viewImage}
                    alt="Enlarged view"
                    className="w-full h-full object-contain"
                  />
                  <button
                    className="absolute top-2 right-2 text-red-500 bg-black bg-opacity-50 rounded-full p-1"
                    onClick={() => setViewImage(null)}
                  >
                    <i className="ph-duotone ph-x text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard
