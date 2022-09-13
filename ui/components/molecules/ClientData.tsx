import { useState } from "react";

function ClientData({
  name,
  logoUrl,
  title
}: {
  name: string;
  logoUrl: string;
  title: string;
}) {

  const [src, setSrc] = useState(logoUrl)

  return (
    <div className="border-b w-full pb-4 md:pb-0">
      <img
        className="h-14 w-14 object-contain border-brand_gray1 border-2 rounded-full p-[0.5px]"
        src={src}
        onError={() => setSrc('https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/flam_logo.png')}
      />
      <h2 className="text-xl font-bold text-brand_black mt-3 mb-2">{name}</h2>
      <p className="text-brand_gray2 text-sm font-semibold">{title}</p>
    </div>
  );
}

// Order ID: FLM021332   |   Digital Print - Matte

export default ClientData;
