interface SourceBadgeProps {
  source?: 'graph'
}

export function SourceBadge({ source }: SourceBadgeProps) {
  if (!source) return null

  return (
    <span className="flex-shrink-0 self-start text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">
      Graph API
    </span>
  )
}