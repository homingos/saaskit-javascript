import React from "react";

interface TooltipProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, title }) => {
  return (
    <div className="tooltip">
      {children}
      <span className="tooltiptext">{title}</span>
    </div>
  );
};

export default Tooltip;
