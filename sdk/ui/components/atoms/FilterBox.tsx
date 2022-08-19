interface FilterBoxProps extends React.HTMLAttributes<HTMLDivElement> {}

const FilterBox: React.FC<FilterBoxProps> = ({ ...props }) => {
  return (
    <div className="w-full" {...props}>
      <img src="" alt="filter" className="h-24 w-24 border-[1px] border-[#E5E7EB] rounded-2xl bg-white shadow-sm"/>
    </div>
  );
};

export default FilterBox;
