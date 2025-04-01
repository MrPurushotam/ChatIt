import ProgressiveImage from "./ProgressiveImage";

const IndividualUser = ({ chatDetail, onClick, loggedUser, isActive = true }) => {
  const date = new Date(chatDetail?.lastMessageAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className={`z-0 w-full flex flex-row shadow-sm px-2 py-3 gap-2 cursor-default transition-colors ${isActive ? "border-l-4 border-l-red-500 bg-[#f6f6f6]" : "hover:bg-gray-50"}`} onClick={onClick}>
      <div className='w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full overflow-hidden object-contain flex items-center justify-center bg-transparent '>

        {
          chatDetail.otherUserProfile ?
            <ProgressiveImage src={chatDetail.otherUserProfile}>
              {(src, loading) => (
                <img
                  src={src}
                  alt="Profile"
                  className={`isolate z-0 h-full w-full transition-opacity duration-500 ease-in-out object-cover rounded-full cursor-pointer ${loading ? "opacity-50" : "opacity-100"}`}
                />
              )}
            </ProgressiveImage>
            :
            (<i className="ph-duotone ph-user text-2xl sm:text-3xl text-gray-600"></i>)
        }
      </div>

      <div className="flex flex-col flex-grow min-w-0">
        <div className='flex flex-row gap-1 items-center mb-0.5'>
          <h2 className="text-base sm:text-lg font-bold truncate">{chatDetail?.otherUserName}</h2>
          <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0`} style={{ background: `${chatDetail?.isOnline ? "#22c55e" : "#9ca3af"}` }}></span>
          <h3 className="text-xs sm:text-sm text-gray-500 font-medium ml-auto flex-shrink-0">{date}</h3>
        </div>
        <div className="text-sm sm:text-base truncate">
          {chatDetail?.lastMessage.split("\n")[0].substring(0, 33)}
        </div>
      </div>

      <div className="flex-shrink-0 ml-2 ">
        <span className="inline-flex px-2 py-1 items-center justify-center rounded-full bg-[#bebbb4] w-5 h-5 sm:w-6 sm:h-6 text-xs sm:text-sm font-medium text-black"
          style={{ display: (chatDetail.lastMessageSenderId === loggedUser?.id || chatDetail.unreadCount < 1) ? "none" : "inline" }} >{chatDetail.unreadCount > 9 ? "9+" : chatDetail.unreadCount}</span>
      </div>
    </div>
  )
}

export default IndividualUser
