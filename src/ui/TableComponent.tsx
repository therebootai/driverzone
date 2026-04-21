export default function TableComponent({
  TABLE_HEAD,
  TABLE_ROWS,
}: {
  TABLE_HEAD: string[];
  TABLE_ROWS: React.ReactElement[];
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max table-auto text-left">
        <thead className="bg-site-stone">
          <tr>
            {TABLE_HEAD.map((head) => (
              <th
                key={head}
                className="text-site-black text-base py-4 px-2.5 font-semibold"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{TABLE_ROWS}</tbody>
      </table>
    </div>
  );
}
