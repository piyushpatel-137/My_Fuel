const toneMap = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-sky-200 bg-sky-50 text-sky-800"
};

const Notice = ({ tone = "info", children }) => {
  if (!children) return null;
  return <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${toneMap[tone]}`}>{children}</div>;
};

export default Notice;

