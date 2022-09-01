import React from 'react';

const DropArea: React.FC<{
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ disabled = false, children, className }) => {
  return (
    <div
      className={`border-dashed border-[color:var(--primary)] border-2 rounded-xl bg-brand_lightblue w-full h-full flex flex-col justify-center items-center p-2 cursor-pointer overflow-hidden ${
        className || ''
      } ${disabled ? 'grayscale' : ''}`}
    >
      {children}
    </div>
  );
};

export default DropArea;
