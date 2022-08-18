import React from "react";

const FileContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="fileContainer">{children}</div>;
};

export default FileContainer;

