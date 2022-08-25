import React, { Dispatch, SetStateAction } from 'react';

const CardMessage: React.FC<{
  existingText: string;
  text: string;
  setData: Dispatch<SetStateAction<any>>;
}> = ({ existingText, text, setData }) => {
  return (
    <div className="mb-3">
      <h4 className="font-bold text-sm text-brand_black mb-2">Message</h4>
      <input
        type="text"
        placeholder="Enter your message"
        className="border-2 w-full rounded-md px-3 py-2 text-sm focus:outline-brand_blue"
        value={text}
        onChange={e =>
          setData((prev: any) => ({ ...prev, text: e.target.value }))
        }
      />
    </div>
  );
};

export default CardMessage;
