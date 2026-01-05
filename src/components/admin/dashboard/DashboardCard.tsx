export default function DashboardCard({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-2 lg:p-8 p-4 bg-neutral-50 border border-neutral-200 rounded-xl lg:px-10 lg:py-7 px-6 py-4">
      <h2 className="text-site-black lg:text-base text-sm">{title}</h2>
      <h1 className="text-site-black font-semibold lg:text-2xl text-xl">
        {count}
      </h1>
    </div>
  );
}
