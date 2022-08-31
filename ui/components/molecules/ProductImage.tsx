import { IoMdImage } from 'react-icons/io';
import { useDropzone } from 'react-dropzone';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import DropArea from '../atoms/DropArea';

function ProductImage({
  existingPhoto,
  photo,
  setData
}: {
  existingPhoto: string;
  photo: any;
  setData: Dispatch<SetStateAction<any>>;
}) {
  const [files, setFiles] = useState<any[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg'],
      'image/jpg': ['.jpg']
    },
    onDrop: (acceptedFiles: any) => {
      setFiles(
        acceptedFiles.map((file: File) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );

      setData((prev: any) => ({
        ...prev,
        photo: acceptedFiles[0]
      }));
    }
  });

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <>
      {existingPhoto ? (
        <div className="h-36 w-full md:w-36 shrink-0">
          <div className="w-full h-full flex justify-start bg-brand_lightblue border-brand_blue border-2 rounded-xl p-2">
            <img
              key={existingPhoto}
              className="h-full w-auto rounded-xl object-contain"
              src={existingPhoto}
            />
          </div>
        </div>
      ) : (
        <div
          {...getRootProps({ className: 'dropzone' })}
          className="h-36 w-full md:w-36 shrink-0"
        >
          <input {...getInputProps()} />
          <DropArea className={photo ? 'p-0' : ''}>
            {photo ? (
              <div className="flex justify-start">
                <img
                  key={photo.preview}
                  className="h-full w-auto  rounded-xl"
                  src={photo.preview}
                  // Revoke data uri after image is loaded
                  onLoad={() => {
                    URL.revokeObjectURL(photo.preview);
                  }}
                />
              </div>
            ) : (
              <>
                <IoMdImage className="text-brand_blue w-6 md:w-5 h-6 md:h-5 mb-3 md:mb-2 " />

                <p className="text-sm md:text-xs text-brand_black2 font-bold">
                  Upload Photo
                </p>
                <p className="text-xs md:text-[0.5rem] text-brand_black2 font-bold text-center">
                  Drag and drop files, or{' '}
                  <span className="text-brand_blue">Browse</span>
                </p>
                <p className="text-xs md:text-[0.6rem] text-brand_gray2 mt-2 md:mt-1">
                  Max. file size: 10MB
                </p>
              </>
            )}
          </DropArea>
        </div>
      )}
    </>
  );
}

export default ProductImage;
