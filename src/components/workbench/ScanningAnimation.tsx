import { useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ScanningAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number; // 动画持续时间（毫秒）
}

export function ScanningAnimation({ isActive, onComplete, duration = 2500 }: ScanningAnimationProps) {
  const dotLottieRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      // 当激活时，开始播放动画
      dotLottieRef.current?.play();

      // 设置定时器在指定时间后停止动画
      const timer = setTimeout(() => {
        dotLottieRef.current?.stop();
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // 当不激活时，停止动画
      dotLottieRef.current?.stop();
    }
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <DotLottieReact
        src="https://lottie.host/7193ad0e-0c68-47a7-a675-8dddd1a62849/fGAoHhQayX.lottie"
        loop
        autoplay
        dotLottieRefCallback={(dotLottie) => {
          dotLottieRef.current = dotLottie;
        }}
        style={{ width: '400px', height: '400px' }}
      />
    </div>
  );
}
