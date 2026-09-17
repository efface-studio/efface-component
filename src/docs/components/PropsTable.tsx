export interface PropRow {
  name: string
  type: string
  default?: string
  desc: string
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-bg-soft font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">
            <th className="px-4 py-2.5 font-medium">prop</th>
            <th className="px-4 py-2.5 font-medium">type</th>
            <th className="px-4 py-2.5 font-medium">default</th>
            <th className="px-4 py-2.5 font-medium">설명</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 font-mono text-accent">{r.name}</td>
              <td className="px-4 py-2.5 font-mono text-fg-dim">{r.type}</td>
              <td className="px-4 py-2.5 font-mono text-fg-faint">{r.default ?? '—'}</td>
              <td className="px-4 py-2.5 text-fg-dim">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
