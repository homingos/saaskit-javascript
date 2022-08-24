import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { IoMdImage } from 'react-icons/io';
import DropArea from '../atoms/DropArea';

const VideoUpload = ({
  existingVideo,
  video,
  setData
}: {
  existingVideo: string;
  video: any;
  setData: Dispatch<SetStateAction<any>>;
}) => {
  const [files, setFiles] = useState<any[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'video/*': ['.mp4']
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
        video: acceptedFiles[0]
      }));
    }
  });

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <div className="mb-3">
      <h4 className="font-bold text-sm text-[#111827] mb-2">Upload Video</h4>
      <div
        {...getRootProps({ className: 'dropzone' })}
        className="h-32 w-full shrink-0"
      >
        <input {...getInputProps()} />
        <DropArea>
          {video ? (
            <div className="h-full w-full flex gap-4 items-center p-2">
              <video
                key={video.preview}
                className="h-full w-24 border rounded-xl shrink-0"
              >
                <source
                  src={video.preview}
                  // Revoke data uri after image is loaded
                  onLoad={() => {
                    URL.revokeObjectURL(video.preview);
                  }}
                  id="video_here"
                />
                Your browser does not support HTML5 video.
              </video>
              <div className="grow-0 w-full overflow-hidden">
                <p className="text-[#111827] text-xs md:text-md truncate w-full grow-0 mb-2">
                  {files[0].name} {files[0].name} {files[0].name}
                </p>
                <p className="text-[#9CA3AF] text-[0.6rem] md:text-xs">
                  Uploading Completed
                </p>
              </div>
            </div>
          ) : (
            <>
              <IoMdImage className="text-[#1D4ED8] w-6 md:w-5 h-6 md:h-5 mb-3 md:mb-2 " />
              <p className="text-xs md:text-[0.8rem] text-[#374151] font-bold">
                Drag and drop files, or{' '}
                <span className="text-[#1D4ED8]">Browse</span>
              </p>
              <p className="text-xs md:text-[0.7rem] text-[#6B7280] mt-2 md:mt-1">
                Max. file size: 10MB
              </p>
            </>
          )}
        </DropArea>
      </div>
    </div>
  );
};

export default VideoUpload;
