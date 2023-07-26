export const Symbol = ({ spaceRight = false }: { spaceRight?: boolean }) => (
  <div className="{'text-code-symbol' + (spaceRight ? ' mr-3' : '')}">
    <slot />
  </div>
)
