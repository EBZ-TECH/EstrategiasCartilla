/** Mosaico CSS instantáneo (sin canvas lento ni parpadeos). */
export function MosaicBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`mosaic-stack ${className}`.trim()} aria-hidden="true">
      <div className="mosaic-layer mosaic-layer--a" />
      <div className="mosaic-layer mosaic-layer--b" />
      <div className="mosaic-layer mosaic-layer--c" />
    </div>
  )
}
