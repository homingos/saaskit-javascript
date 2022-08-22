import React from "react";

const Scrollable: React.FC<{ children: React.ReactNode, vertical?: boolean, horizontal?: boolean, className?: string }> = ({ children, vertical = true, horizontal = false, className = "" }) => {
    return <div className={`custom-scrollbar ${vertical && "overflow-y-auto pr-2"} ${horizontal && "overflow-x-auto pb-2"} ${className}`}>{children}</div>
}

export default Scrollable;