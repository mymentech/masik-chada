export default function LogoMark({ size = 36, bg = '#16a34a' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <rect width="80" height="80" rx="18" fill={bg}/>
      <rect x="12" y="55" width="56" height="6" rx="2" fill="white"/>
      <rect x="11" y="38" width="10" height="19" rx="3" fill="white"/>
      <path d="M11 38 Q16 31 21 38Z" fill="white"/>
      <rect x="59" y="38" width="10" height="19" rx="3" fill="white"/>
      <path d="M59 38 Q64 31 69 38Z" fill="white"/>
      <path d="M21 55 Q21 29 40 29 Q59 29 59 55Z" fill="white"/>
      <circle cx="40" cy="23" r="10" fill="white"/>
      <circle cx="44.5" cy="19.5" r="9" fill={bg}/>
      <circle cx="50" cy="17" r="2.2" fill="white"/>
    </svg>
  );
}