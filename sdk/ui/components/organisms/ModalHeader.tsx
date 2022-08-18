import ClientData from "../molecules/ClientData"
import ProductImage from "../molecules/ProductImage"

function ModalHeader () {
    return <div className="flex gap-8">
        <ClientData />
        <ProductImage /> 
    </div>
}

export default ModalHeader