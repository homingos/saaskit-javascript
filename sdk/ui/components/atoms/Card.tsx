const Card:React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => {
    return (
        <div className={`bg-white shadow-md h-full md:h-[80vh] w-full md:w-[40rem] lg:w-[50rem] md:rounded-2xl py-4 px-6 ${className}`}>
            {children}
        </div>
    )
}

export default Card