import Image from 'next/image';
import clsx from 'clsx';

type MediaFit = 'cover' | 'contain';

interface BrandMediaLayerProps {
  imageSrc?: string | null;
  videoSrc?: string | null;
  alt?: string;
  /** fill 레이어의 object-fit */
  fit?: MediaFit;
  /** 위에 얹을 오버레이(가독성 확보) */
  overlayClassName?: string;
  /** 컨테이너(absolute inset-0) class */
  className?: string;
  /** next/image priority */
  priority?: boolean;
}

export function BrandMediaLayer({
  imageSrc,
  videoSrc,
  alt = '브랜드 이미지',
  fit = 'cover',
  overlayClassName,
  className,
  priority = false,
}: BrandMediaLayerProps) {
  if (!imageSrc && !videoSrc) return null;

  return (
    <div className={clsx('absolute inset-0 pointer-events-none', className)} aria-hidden="true">
      {videoSrc ? (
        <video
          className={clsx('h-full w-full', fit === 'contain' ? 'object-contain' : 'object-cover')}
          src={videoSrc}
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
        />
      ) : (
        <Image
          src={imageSrc as string}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 768px"
          className={clsx(fit === 'contain' ? 'object-contain' : 'object-cover', 'object-center')}
        />
      )}

      {/* 가독성/브랜딩 톤 유지용 오버레이 */}
      <div
        className={clsx(
          'absolute inset-0',
          overlayClassName ?? 'bg-gradient-to-b from-black/10 via-black/20 to-black/35'
        )}
      />
    </div>
  );
}

