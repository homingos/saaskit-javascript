import { AiFillInfoCircle } from "react-icons/ai"
import Tooltip from "../atoms/Tooltip"
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im"
import { useEffect, useState } from "react"

const ModalFooter = () => {
    const [checkbox, setCheckbox] = useState(false);

    return <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 pt-2">
        <div>
            <div className="flex items-baseline md:items-center gap-2">
                <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => setCheckbox(prev => !prev)}>
                    {checkbox ? <ImCheckboxChecked className="h-4 w-4 md:h-3 md:w-3 text-[#1D4ED8]" /> : <ImCheckboxUnchecked className="h-4 w-4 md:h-3 md:w-3 text-[#1D4ED8]" />}

                    <input type="checkbox" className="hidden" id="video-later" />
                    <label className="font-semibold text-sm text-[#111827]" htmlFor="video-later">Upload video later</label>
                </div>
                <Tooltip
                    title={`Once your order is placed, you will get a link on your email to
                            upload the video and select 3D filter. The link will be live for
                            72 hours from the time the order is placed.`}
                    className="md:hidden"
                >
                    <AiFillInfoCircle className="md:hidden" />
                </Tooltip>
            </div>
            <p className="hidden md:block text-[0.6rem] text-[#6B7280]">
                Once your order is placed, you will get a link on your email to
                upload the video and select 3D filter. The link will be live for
                72 hours from the time the order is placed.
            </p>
        </div>
        <div className="w-full md:w-2/3">
            <button className="bg-[#1D4ED8] text-white text-sm font-bold py-2 px-16 h-min w-full rounded-lg">Submit</button>
        </div>
    </div>
}

export default ModalFooter