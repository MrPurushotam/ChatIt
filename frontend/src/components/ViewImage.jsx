import React from 'react';
import { useRecoilState } from 'recoil';
import { viewImageAtom } from '../states/atoms';

const ViewImage = () => {
  const [viewImage, setViewImage] = useRecoilState(viewImageAtom);

  if (!viewImage) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60  flex items-center justify-center z-50 p-4"
      onClick={() => setViewImage(null)}
    >
      <div
        className="relative w-full max-w-[90vw] md:max-w-[60vw] max-h-[80vh] flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.6) 100%)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={viewImage}
          alt="Enlarged view"
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-lg"
        />
        <button
          className="absolute top-2 right-2 text-red-500 bg-black/70 hover:text-red-400 hover:shadow-red-500 hover:shadow-md rounded-full p-1"
          onClick={() => setViewImage(null)}
        >
          <i className="ph-duotone ph-x text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default ViewImage;
