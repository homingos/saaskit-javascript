import { Dispatch, SetStateAction } from 'react';
import ClientData from '../molecules/ClientData';
import ProductImage from '../molecules/ProductImage';

function ModalHeader({
  title,
  showPhoto,
  photo,
  setData
}: {
  title: string;
  showPhoto: boolean;
  photo: File;
  setData: Dispatch<SetStateAction<any>>;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
      <ClientData title={title} />
      {showPhoto && (
        <div className="hidden md:block">
          <ProductImage existingPhoto="" photo={photo} setData={setData} />
        </div>
      )}
    </div>
  );
}

export default ModalHeader;
