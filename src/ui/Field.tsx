const Field = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex flex-col mb-3">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || "-"}</span>
  </div>
);

export default Field;
