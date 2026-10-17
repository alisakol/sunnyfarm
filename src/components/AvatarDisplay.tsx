import React, { useState } from 'react';

export function isUrlAvatar(str?: string | null): boolean {
  if (!str) return false;
  const s = str.trim();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('//') ||
    s.startsWith('/') ||
    s.startsWith('data:image') ||
    s.includes('googleusercontent.com') ||
    /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(s)
  );
}

interface AvatarDisplayProps {
  avatar?: string | null;
  photoURL?: string | null;
  name?: string;
  className?: string;
  imageClassName?: string;
  fallbackEmoji?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  photoURL,
  name,
  className = '',
  imageClassName = 'w-full h-full object-cover rounded-full',
  fallbackEmoji = '🧑‍🌾',
}) => {
  const [hasError, setHasError] = useState(false);

  const candidateUrl =
    photoURL && isUrlAvatar(photoURL)
      ? photoURL.trim()
      : avatar && isUrlAvatar(avatar)
      ? avatar.trim()
      : null;

  if (candidateUrl && !hasError) {
    return (
      <img
        src={candidateUrl}
        alt={name || 'Аватар'}
        className={imageClassName}
        onError={() => setHasError(true)}
      />
    );
  }

  const emoji = avatar && !isUrlAvatar(avatar) ? avatar : fallbackEmoji;

  return <span className={`inline-flex items-center justify-center select-none ${className}`}>{emoji}</span>;
};
