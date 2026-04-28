const EmptyState = ({ icon: Icon, title, text }) => {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
        <Icon size={22} />
      </div>
      <p className="mt-3 font-semibold text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
    </div>
  );
};

export default EmptyState;

