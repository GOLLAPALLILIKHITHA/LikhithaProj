interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
}

export default function Logo({ size = 'md', dark = false }: LogoProps) {
  const sizes = { sm: { height: 32 }, md: { height: 40 }, lg: { height: 56 } };
  const s = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src="/logo.png" 
        alt="INFRAALL Logo" 
        style={{ 
          height: s.height,
          width: 'auto',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}

