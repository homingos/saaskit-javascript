import { useDropzone } from "react-dropzone";
import { IoMdImage } from "react-icons/io";
import DropArea from "../atoms/DropArea";

const VideoUpload = () => {
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        multiple: false,
        accept: {
            'image/*': ['.png', '.jpeg', '.jpg']
        }
    });

    return <div className="mb-3">
        <h4 className="font-bold text-sm text-[#111827] mb-2">Upload Video</h4>
        <div {...getRootProps({ className: 'dropzone' })} className="h-32 w-full shrink-0" >
            <input {...getInputProps()} />
            <DropArea>
                <IoMdImage className="text-[#1D4ED8] w-6 md:w-5 h-6 md:h-5 mb-3 md:mb-2 " />
                <p className="text-xs md:text-[0.8rem] text-[#374151] font-bold">Drag and drop files, or <span className="text-[#1D4ED8]">Browse</span></p>
                <p className="text-xs md:text-[0.7rem] text-[#6B7280] mt-2 md:mt-1">Max. file size: 10MB</p>
            </DropArea>
        </div>
    </div>
}

export default VideoUpload;