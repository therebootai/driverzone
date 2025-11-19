export default function TableComponent({
  TABLE_HEAD,
  TABLE_ROWS,
}: {
  TABLE_HEAD: string[];
  TABLE_ROWS: React.HTMLAttributes<HTMLTableCellElement>[];
}) {
  return (
    <table className="w-full min-w-max table-auto text-left">
      <thead className="bg-site-stone">
        <tr>
          {TABLE_HEAD.map((head) => (
            <th
              key={head}
              className="font-medium text-site-black text-base pb-4 pt-10"
            >
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TABLE_ROWS.map((row, rowIndex) => (
          <tr key={rowIndex} className="even:bg-neutral-50">
            <td {...row} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
