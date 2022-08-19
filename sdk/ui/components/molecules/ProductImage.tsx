import { IoMdImage } from "react-icons/io"
import { useDropzone } from 'react-dropzone';
import { useEffect } from "react";
import FileContainer from "../atoms/FileContainer";

function ProductImage() {
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        multiple: false,
        accept: {
            'image/*': ['.png', '.jpeg', '.jpg']
        }
    });

    useEffect(() => {
        console.log(acceptedFiles)
    }, [acceptedFiles])

    return <div {...getRootProps({ className: 'dropzone' })} className="border-dashed border-[#1D4ED8] border-2 rounded-xl h-36 w-full md:w-36 bg-[#EFF6FF] shrink-0 flex flex-col justify-center items-center p-2" >
        <input {...getInputProps()} />
        <IoMdImage className="text-[#1D4ED8] w-6 md:w-5 h-6 md:h-5 mb-3 md:mb-2" />
        <p className="text-sm md:text-xs text-[#374151] font-bold">Upload Photo</p>
        <p className="text-xs md:text-[0.5rem] text-[#374151] font-bold">Drag and drop files, or <span className="text-[#1D4ED8]">Browse</span></p>
        <p className="text-xs md:text-[0.6rem] text-[#6B7280] mt-2 md:mt-1">Max. file size: 10MB</p>
    </div>
}

export default ProductImage;