'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fallbackText?: string;
}

export default function Logo({ src, alt, width = 120, height = 32, fallbackText }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError && fallbackText) {
    return (
      <Typography
        sx={{
          color: '#fe5000',
          fontWeight: 700,
          fontSize: '1rem',
          letterSpacing: '0.1em',
        }}
      >
        {fallbackText}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'contain' }}
        onError={() => setImageError(true)}
      />
    </Box>
  );
}

