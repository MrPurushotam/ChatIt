import React from 'react'

const SingleMessageUi = ({ message, isUser, messageSentBy }) => {

  const date = new Date(message.sentAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const getGridClass = (numAttachments) => {
    if (numAttachments === 1) return 'grid-cols-1';
    if (numAttachments === 2) return 'grid-cols-2';
    if (numAttachments === 4) return 'grid-cols-2 grid-rows-2';
    return `grid-cols-${Math.min(3, numAttachments)} grid-rows-${Math.ceil(numAttachments / 3)}`;
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col w-full sm:w-10/12 md:w-8/12 lg:w-6/12 px-2 py-1 rounded-md shadow-md ${isUser ? "bg-[#ee6145]/85 text-white" : "bg-white text-black"}`}>
        <p className='text-base font-semibold'>{messageSentBy.length > 20 ? messageSentBy.substring(0, 20) : messageSentBy}</p>

        {message.attachments?.length > 0 && (
          <div className={`grid gap-2 ${getGridClass(message.attachments.length)} aspect-ratio aspect-square h-48 sm:h-56 md:h-64 lg:h-72 w-full `}>
            {message.attachments.map((attachment, index) => {
              if (attachment.fileType.includes("image")) {
                return (
                  <img
                    key={attachment.id}
                    src={attachment.fileUrl}
                    alt={attachment.fileName}
                    className="object-cover rounded-md h-full w-full"
                  />
                );
              } else if (attachment.fileType.includes("video")) {
                return (
                  <video
                    key={index}
                    controls
                    className="rounded-md h-full w-full object-cover"
                    src={attachment.fileUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              } else if (attachment.fileType.includes("audio")) {
                return (
                  <audio
                    key={index}
                    controls
                    className="rounded-md w-full"
                    src={attachment.fileUrl}
                  >
                    Your browser does not support the audio tag.
                  </audio>
                );
              }
              else {
                return (
                  <div key={index} className="flex flex-col items-center justify-center p-2 border border-gray-300 rounded-md bg-gray-50 h-full w-full">
                    <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {attachment.fileName}
                    </a>
                    <p className="text-xs text-gray-400">File Type: {attachment.fileType}</p>
                    <p className="text-xs text-gray-400">Size: {attachment.fileSize} KB</p>
                  </div>
                );
              }
            })}
          </div>
        )}

        <p className='text-base break-words whitespace-pre-wrap'>{message.content}</p>
        <span className='text-xs'>{date} <span className={`text-semibold text-gray-300 mx-1`}>{messageSentBy === "You" ? message.status : null}</span></span>
      </div>
    </div>
  );
}

export default SingleMessageUi;
