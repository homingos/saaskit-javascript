import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AiFillInfoCircle } from 'react-icons/ai';
import { ImCheckboxChecked, ImCheckboxUnchecked } from 'react-icons/im';

import Tooltip from '../atoms/Tooltip';

const ModalFooter = ({
  isUpdate = false,
  isLoading,
  showLaterOption,
  handleSubmit,
  is_deferred,
  setData
}: {
  isUpdate?: boolean;
  isLoading: boolean;
  showLaterOption: boolean;
  handleSubmit: (data: any) => void;
  is_deferred: boolean;
  setData?: Dispatch<SetStateAction<any>>;
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row items-stretch md:items-center gap-4 pt-2 ${
        !showLaterOption && 'justify-end items-end'
      }`}
    >
      {showLaterOption && (
        <div>
          <div className="flex items-center md:items-center gap-2">
            <div
              className="flex items-baseline gap-2 cursor-pointer"
              onClick={e => {
                e.preventDefault();
                if (setData) {
                  setData((prev: any) => ({
                    ...prev,
                    is_deferred: !is_deferred
                  }));
                }
              }}
            >
              {is_deferred ? (
                <ImCheckboxChecked className="h-4 w-4 md:h-3 md:w-3 text-[color:var(--primary)]" />
              ) : (
                <ImCheckboxUnchecked className="h-4 w-4 md:h-3 md:w-3 text-[color:var(--primary)]" />
              )}

              <input type="checkbox" className="hidden" id="video-later" />
              <label
                className="font-semibold text-sm text-brand_black"
                htmlFor="video-later"
              >
                Upload video later
              </label>
            </div>
            <Tooltip
              title={`Once your order is placed, you will get a link on your email to upload the video and select 3D filter. The link will be live for 72 hours from the time the order is placed.`}
              className="md:hidden"
            >
              <AiFillInfoCircle className="md:hidden text-[color:var(--primary)]" />
            </Tooltip>
          </div>
          <p className="hidden md:block text-[0.6rem] text-brand_gray2">
            Once your order is placed, you will get a link on your email to
            upload the video and select 3D filter. The link will be live for 72
            hours from the time the order is placed.
          </p>
        </div>
      )}
      {isUpdate && (
        <div className="pr-6">
          <p className="font-semibold text-sm text-brand_black">Please Note</p>
          <p className="text-[0.6rem] text-brand_gray2">
            You can upload the video only once, Please be careful in selecting
            the video!
          </p>
        </div>
      )}
      <div className={`w-full ${showLaterOption ? 'md:w-2/3' : 'md:w-1/3'}`}>
        <button
          className="bg-[color:var(--primary)] text-white text-sm font-bold py-2 px-16 h-min w-full rounded-lg"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default ModalFooter;
