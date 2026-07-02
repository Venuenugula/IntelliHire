import Image from "next/image";

export function ReferenceVisual({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={`${width}px`}
        className="object-contain object-center"
        draggable={false}
      />
    </div>
  );
}
