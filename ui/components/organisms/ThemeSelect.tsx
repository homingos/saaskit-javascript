import FilterBox from '../atoms/FilterBox';
import Scrollable from '../atoms/Scrollable';

const ThemeSelect = () => {
  return (
    <div>
      <h4 className="font-bold text-sm text-brand_black mb-2">
        Select 3D Filter
      </h4>
      <Scrollable vertical={false} horizontal>
        <div className="flex gap-4 w-max">
          {Array.of(
            [1, 2, 3, 4, 5, 6, 7, 8]
              .fill(1)
              .map((item, index) => <FilterBox key={index} />)
          )}
        </div>
      </Scrollable>
    </div>
  );
};

export default ThemeSelect;
