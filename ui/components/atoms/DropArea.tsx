import React from "react"

const DropArea: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }: any) => {
    return <div className={`border-dashed border-[#1D4ED8] border-2 rounded-xl bg-[#EFF6FF] w-full h-full flex flex-col justify-center items-center p-2 cursor-pointer ${className}`}>{children}</div>
}

export default DropArea;