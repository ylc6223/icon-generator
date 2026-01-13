import { useEffect, useState } from 'react';

/**
 * 防抖 Hook
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // 使用 debouncedSearchTerm 进行搜索
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置定时器
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清除定时器
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖函数 Hook
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * const debouncedSave = useDebouncedCallback(() => {
 *   saveData();
 * }, 1000);
 *
 * <input onChange={debouncedSave} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  return ((...args: Parameters<T>) => {
    // 简单的防抖实现，使用闭包保存定时器 ID
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...innerArgs: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        fn(...innerArgs);
      }, delay);
    };
  })() as T;
}
