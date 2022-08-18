const FlexCenter:React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <div className="flex justify-center items-center h-full w-full">
            {children}
        </div>
    )
}

export default FlexCenter