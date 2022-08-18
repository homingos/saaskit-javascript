const FlexCenter:React.FC<{children: React.ReactNode; col?: boolean}> = ({ children, col = false }) => {
    return (
        <div className={`flex justify-center items-center h-full w-full ${col && "flex-col"}`}>
            {children}
        </div>
    )
}

export default FlexCenter