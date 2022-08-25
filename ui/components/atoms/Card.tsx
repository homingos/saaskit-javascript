const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <div
      className={`bg-white shadow-md h-full md:max-h-[40rem] md:h-min md:min-h-[20rem] w-full md:w-[40rem] md:rounded-2xl py-4 px-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
