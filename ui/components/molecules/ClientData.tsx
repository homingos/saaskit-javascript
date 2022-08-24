function ClientData({ title }: { title: string }) {
  return (
    <div className="border-b w-full pb-4 md:pb-0">
      <img
        className="h-14 w-14 border-[#D1D5DB] border-2 rounded-full p-[0.5px]"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png"
      />
      <h2 className="text-xl font-bold text-[#111827] mt-3 mb-2">
        John Doe Prints
      </h2>
      <p className="text-[#6B7280] text-sm font-semibold">{title}</p>
    </div>
  );
}

// Order ID: FLM021332   |   Digital Print - Matte

export default ClientData;
