/**
 * 动画组件封装
 * 基于 framer-motion 提供常用的动画效果
 */

import { motion, HTMLMotionProps } from 'framer-motion';

/**
 * 淡入动画组件
 */
export function FadeIn(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    />
  );
}

/**
 * 滑入动画组件（从上方）
 */
export function SlideIn(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      {...props}
    />
  );
}

/**
 * 缩放动画组件
 */
export function ScaleIn(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      {...props}
    />
  );
}

/**
 * 边界框动画组件
 * 用于边界框选择时的动画效果
 */
export function BoundingBoxMotion(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    />
  );
}

/**
 * 按钮动画组件
 */
export function ButtonMotion(props: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    />
  );
}
