const Card:React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => {
    return (
        <div className={`bg-white shadow-md h-[80vh] w-[40rem] lg:w-[50rem] rounded-2xl ${className}`}>
            {children}
        </div>
    )
}

export default Card