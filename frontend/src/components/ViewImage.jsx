import React from 'react';
import { useRecoilState } from 'recoil';
import { viewImageAtom } from '../states/atoms';

// FIXME: a minor bug over big screen where there is gap btw image and close button fix it
const ViewImage = () => {
  const [viewImage, setViewImage] = useRecoilState(viewImageAtom);

  if (!viewImage) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={() => setViewImage(null)}
    >
      <div
        className="relative w-full max-w-[90vw] md:max-w-[60vw] max-h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={viewImage}
          alt="Enlarged view"
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-lg"
        />
        <button
          className="absolute top-2 right-2 text-red-500 bg-black bg-opacity-50 rounded-full p-1"
          onClick={() => setViewImage(null)}
        >
          <i className="ph-duotone ph-x text-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default ViewImage;
