type Props = {
  values: Record<string, string>;
};

export default function PlaceholderPreview({ values }: Props) {
  const keys = Object.keys(values);
  if (!keys.length) return null;

  return (
    <div className="overflow-x-auto border rounded mb-4 w-full">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left font-semibold text-gray-700">
              Placeholder
            </th>
            <th className="border px-3 py-2 text-left font-semibold text-gray-700">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k}>
              <td className="border px-3 py-2 text-gray-600">{k}</td>
              <td className="border px-3 py-2 text-gray-800">{values[k]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
