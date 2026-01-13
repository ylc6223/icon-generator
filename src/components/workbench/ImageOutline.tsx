import { useEffect, useRef, useState } from 'react';

interface ImageOutlineProps {
  targetSelector: string;
}

export function ImageOutline({ targetSelector }: ImageOutlineProps) {
  const [position, setPosition] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const updatePosition = () => {
      const img = document.querySelector(targetSelector) as HTMLImageElement;
      if (img) {
        // 获取轮廓容器（它自己）的offset parent
        const outlineEl = document.querySelector('.absolute.pointer-events-none.z-40');
        if (!outlineEl) return;

        const offsetParent = (outlineEl as HTMLElement).offsetParent as HTMLElement;
        if (!offsetParent) return;

        // 计算图片相对于offset parent的位置
        const imgRect = img.getBoundingClientRect();
        const parentRect = offsetParent.getBoundingClientRect();

        setPosition({
          left: imgRect.left - parentRect.left,
          top: imgRect.top - parentRect.top,
          width: imgRect.width,
          height: imgRect.height,
        });
      }
    };

    // 初始更新
    updatePosition();

    // 监听窗口大小变化
    const handleResize = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('resize', handleResize);

    // 监听图片加载
    const img = document.querySelector(targetSelector) as HTMLImageElement;
    if (img) {
      img.addEventListener('load', updatePosition);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (img) {
        img.removeEventListener('load', updatePosition);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetSelector]);

  if (!position) {
    return null;
  }

  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
      }}
    >
      <svg
        width={position.width}
        height={position.height}
        className="overflow-visible"
      >
        {/* 外边框 */}
        <rect
          x="0"
          y="0"
          width={position.width}
          height={position.height}
          fill="none"
          stroke="rgba(59, 130, 246, 0.8)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* 尺寸标注 */}
        <text
          x={position.width / 2}
          y="-8"
          textAnchor="middle"
          fill="rgba(59, 130, 246, 0.9)"
          fontSize="12"
          fontWeight="600"
        >
          {Math.round(position.width)} × {Math.round(position.height)} px
        </text>

        {/* 四个角的标注 */}
        <g fill="rgba(59, 130, 246, 0.6)">
          {/* 左上角 */}
          <circle cx="0" cy="0" r="4" />
          {/* 右上角 */}
          <circle cx={position.width} cy="0" r="4" />
          {/* 左下角 */}
          <circle cx="0" cy={position.height} r="4" />
          {/* 右下角 */}
          <circle cx={position.width} cy={position.height} r="4" />
        </g>

        {/* 中心十字 */}
        <g
          stroke="rgba(59, 130, 246, 0.4)"
          strokeWidth="1"
          strokeDasharray="3,3"
        >
          <line x1={position.width / 2} y1="0" x2={position.width / 2} y2={position.height} />
          <line x1="0" y1={position.height / 2} x2={position.width} y2={position.height / 2} />
        </g>
      </svg>
    </div>
  );
}
