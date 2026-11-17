export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" role="img" aria-label="Vocab App">
      <rect width="40" height="40" rx="12" fill="#065F46" />
      <path d="M10 12.5C15 11 18 12 20 14.5C22 12 25 11 30 12.5V28C25 26.5 22 27.5 20 30C18 27.5 15 26.5 10 28V12.5Z" stroke="#F7F5EF" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 14.5V30M13 17C15 16.5 16.5 17 17.5 17.5M23 17.5C24 17 25.5 16.5 27 17" stroke="#F7F5EF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
