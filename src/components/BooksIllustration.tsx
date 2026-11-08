// Ilustración original de libros con movimiento suave
export default function BooksIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      width="280"
      height="200"
      viewBox="0 0 280 200"
      aria-hidden="true"
      className={className}
    >
      <circle className="animate-floaty" cx="236" cy="38" r="14" fill="#FFD66B" />
      <circle
        className="animate-floaty"
        cx="32"
        cy="64"
        r="9"
        fill="#FF8A65"
        style={{ animationDelay: '-1.2s' }}
      />
      <circle
        className="animate-floaty"
        cx="250"
        cy="110"
        r="6"
        fill="#2FBF8F"
        style={{ animationDelay: '-2.4s' }}
      />
      <rect x="30" y="176" width="220" height="10" rx="5" fill="#C9B8FF" />
      <g className="animate-wiggle">
        <rect x="62" y="78" width="40" height="98" rx="6" fill="#6D4AFF" />
        <rect x="72" y="92" width="20" height="4" rx="2" fill="#E9E1FF" />
        <rect x="72" y="102" width="20" height="4" rx="2" fill="#E9E1FF" />
      </g>
      <rect x="106" y="58" width="44" height="118" rx="6" fill="#FF8A65" />
      <rect x="116" y="76" width="24" height="4" rx="2" fill="#FFE4D6" />
      <rect x="154" y="90" width="38" height="86" rx="6" fill="#2FBF8F" />
      <rect x="163" y="104" width="20" height="4" rx="2" fill="#D8F3E8" />
      <g transform="rotate(-16 220 160)">
        <rect x="196" y="112" width="48" height="64" rx="6" fill="#FFD66B" />
        <rect x="206" y="128" width="28" height="4" rx="2" fill="#FFF1BF" />
      </g>
    </svg>
  )
}
