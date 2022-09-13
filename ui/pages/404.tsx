import FlexCenter from '../components/atoms/FlexCenter';

const NotFound = () => {
  return (
    <div className="h-screen w-screen  bg-white">
      <FlexCenter col className="gap-4">
        <h1 className="text-3xl font-medium">404 | Page not found</h1>
        <a href="https://saas-business.web.app/">
          <button className="bg-brand_blue text-white text-sm font-bold py-2 px-16 h-min w-full rounded-lg">
            Go back to main page
          </button>
        </a>
      </FlexCenter>
    </div>
  );
};

export default NotFound;
