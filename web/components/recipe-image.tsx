"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type RecipeImageProps = {
  src: string | null;
  alt: string;
  sizes: string;
  containerClassName: string;
  fallbackClassName?: string;
};

export function RecipeImage({
  src,
  alt,
  sizes,
  containerClassName,
  fallbackClassName
}: RecipeImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div className={containerClassName}>
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className={
            fallbackClassName ??
            "flex h-full items-center justify-center px-8 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--bg-navy)]"
          }
        >
          No image available
        </div>
      )}
    </div>
  );
}
