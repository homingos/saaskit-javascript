import React from "react"

const DropArea:React.FC<{ children: React.ReactNode, height: string, width: string }> = ({ children, height, width }) => {
    return <div className="border-dashed border-[#1D4ED8] border-2 rounded-xl bg-[#EFF6FF]">{children}</div>
}

export default DropArea;