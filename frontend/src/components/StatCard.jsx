const StatCard = ({ icon: Icon, label, value, helper, accent = "sky" }) => {
  const colors = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-lg ${colors[accent]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

