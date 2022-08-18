import ClientData from "../molecules/ClientData"
import ProductImage from "../molecules/ProductImage"

function ModalHeader () {
    return <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <ClientData />
        <ProductImage /> 
    </div>
}

export default ModalHeader