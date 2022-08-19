import React from "react";

const FileContainer: React.FC<{ children: React.ReactNode,className?:string }> = ({
  children,
  className
}) => {
  return (
    <div className={`flex justify-center items-center rounded-2xl bg-[#EFF6FF] border-2 border-dashed border-[#1D4ED8] ${className}`}>
      {children}
    </div>
  );
};

export default FileContainer;
