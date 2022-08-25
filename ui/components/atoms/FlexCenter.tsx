const FlexCenter: React.FC<{
  children: React.ReactNode;
  col?: boolean;
  className?: string;
}> = ({ children, col = false, className = '' }) => {
  return (
    <div
      className={`flex justify-center items-center h-full w-full ${
        col && 'flex-col'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default FlexCenter;
