import { IoMdImage } from "react-icons/io"
import { useDropzone } from 'react-dropzone';
import { useEffect } from "react";
import DropArea from "../atoms/DropArea";

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

    return <div {...getRootProps({ className: 'dropzone' })} className="h-36 w-full md:w-36 shrink-0" >
        <input {...getInputProps()} />
        <DropArea>
            <IoMdImage className="text-[#1D4ED8] w-6 md:w-5 h-6 md:h-5 mb-3 md:mb-2 " />
            <p className="text-sm md:text-xs text-[#374151] font-bold">Upload Photo</p>
            <p className="text-xs md:text-[0.5rem] text-[#374151] font-bold text-center">Drag and drop files, or <span className="text-[#1D4ED8]">Browse</span></p>
            <p className="text-xs md:text-[0.6rem] text-[#6B7280] mt-2 md:mt-1">Max. file size: 10MB</p>
        </DropArea>
    </div>
}

export default ProductImage;