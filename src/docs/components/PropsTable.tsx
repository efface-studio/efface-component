import { SpecTable } from './SpecTable'

export interface PropRow {
  name: string
  type: string
  default?: string
  desc: string
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <SpecTable
      columns={[
        { key: 'name', label: 'prop', width: '160px', mono: true },
        { key: 'type', label: 'type', width: 'minmax(0,1.2fr)', mono: true },
        { key: 'default', label: 'default', width: '120px', mono: true },
        { key: 'desc', label: '설명', width: 'minmax(0,1.6fr)' },
      ]}
      rows={rows.map((r) => ({ name: r.name, type: r.type, default: r.default, desc: r.desc }))}
    />
  )
}
