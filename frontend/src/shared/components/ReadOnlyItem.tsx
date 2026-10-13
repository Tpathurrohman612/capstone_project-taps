export function ReadOnlyItem({
  label,
  value,
  wide = false,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div
      className={`${
        wide ? 'col-span-2 max-[760px]:col-span-1' : ''
      } border-b border-[#D9E2EC] py-4`}
    >
      <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
        {label.toUpperCase()}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-[#1F2937]">{value}</p>
    </div>
  )
}
