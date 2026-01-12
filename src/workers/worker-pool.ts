/**
 * WorkerPool - WebWorker 任务池
 * 管理固定数量的并发Worker,实现任务队列调度
 */

import { VectorizationPreset, VectorizationResult } from '@/stores/workbench-store';

export interface VectorizeTask {
  id: string;
  imageData: string;
  preset: VectorizationPreset;
}

interface QueuedTask extends VectorizeTask {
  resolve: (result: VectorizationResult) => void;
  reject: (error: Error) => void;
}

interface WorkerInstance {
  worker: Worker;
  busy: boolean;
}

/**
 * WorkerPool 类
 * 固定4个Worker并发,任务队列管理
 */
export class WorkerPool {
  private workers: WorkerInstance[] = [];
  private queue: QueuedTask[] = [];
  private readonly maxWorkers: number = 4; // 固定4个Worker

  constructor() {
    this.initializeWorkers();
  }

  /**
   * 初始化Worker池
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(
        new URL('./vectorizer.ts', import.meta.url),
        { type: 'module' }
      );

      this.workers.push({
        worker,
        busy: false,
      });

      // 监听Worker消息
      worker.addEventListener('message', (event) => {
        this.handleWorkerMessage(worker, event);
      });

      // 监听Worker错误
      worker.addEventListener('error', (error) => {
        console.error('Worker错误:', error);
        this.handleWorkerError(worker, error);
      });
    }
  }

  /**
   * 处理Worker返回的消息
   */
  private handleWorkerMessage(worker: Worker, event: MessageEvent): void {
    const workerInstance = this.workers.find(w => w.worker === worker);
    if (!workerInstance) return;

    const { id, result, error } = event.data;

    // 查找对应的任务
    const taskIndex = this.queue.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const task = this.queue[taskIndex];

    if (error) {
      task.reject(new Error(error));
    } else {
      task.resolve(result);
    }

    // 从队列中移除任务
    this.queue.splice(taskIndex, 1);

    // 标记Worker为空闲
    workerInstance.busy = false;

    // 处理队列中的下一个任务
    this.processQueue();
  }

  /**
   * 处理Worker错误
   */
  private handleWorkerError(worker: Worker, error: ErrorEvent): void {
    const workerInstance = this.workers.find(w => w.worker === worker);
    if (!workerInstance) return;

    console.error('Worker执行错误:', error.message);
    workerInstance.busy = false;

    // 处理队列中的下一个任务
    this.processQueue();
  }

  /**
   * 处理任务队列
   */
  private processQueue(): void {
    // 查找空闲的Worker
    const availableWorker = this.workers.find(w => !w.busy);
    if (!availableWorker || this.queue.length === 0) return;

    // 获取队列中的第一个任务
    const task = this.queue[0];

    // 标记Worker为忙碌
    availableWorker.busy = true;

    // 发送任务给Worker
    availableWorker.worker.postMessage({
      id: task.id,
      imageData: task.imageData,
      preset: task.preset,
    });
  }

  /**
   * 执行矢量化任务
   * @param task 矢量化任务
   * @returns Promise<VectorizationResult>
   */
  public execute(task: VectorizeTask): Promise<VectorizationResult> {
    return new Promise((resolve, reject) => {
      // 将任务添加到队列
      this.queue.push({
        ...task,
        resolve,
        reject,
      });

      // 尝试处理队列
      this.processQueue();
    });
  }

  /**
   * 批量执行矢量化任务
   * @param tasks 矢量化任务数组
   * @param onProgress 进度回调
   * @returns Promise<VectorizationResult[]>
   */
  public async batchExecute(
    tasks: VectorizeTask[],
    onProgress?: (current: number, total: number) => void
  ): Promise<VectorizationResult[]> {
    const results: VectorizationResult[] = [];
    let completed = 0;

    // 创建所有任务的Promise
    const promises = tasks.map(task =>
      this.execute(task).then(result => {
        completed++;
        if (onProgress) {
          onProgress(completed, tasks.length);
        }
        return result;
      })
    );

    // 等待所有任务完成
    const resolvedResults = await Promise.all(promises);
    results.push(...resolvedResults);

    return results;
  }

  /**
   * 获取队列长度
   */
  public getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * 获取活跃Worker数量
   */
  public getActiveWorkers(): number {
    return this.workers.filter(w => w.busy).length;
  }

  /**
   * 终止所有Worker
   */
  public terminate(): void {
    for (const workerInstance of this.workers) {
      workerInstance.worker.terminate();
    }
    this.workers = [];
    this.queue = [];
  }

  /**
   * 等待所有任务完成
   */
  public async waitForIdle(): Promise<void> {
    while (this.queue.length > 0 || this.workers.some(w => w.busy)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// 创建全局WorkerPool单例
let globalPool: WorkerPool | null = null;

/**
 * 获取全局WorkerPool实例
 */
export function getWorkerPool(): WorkerPool {
  if (!globalPool) {
    globalPool = new WorkerPool();
  }
  return globalPool;
}

/**
 * 销毁全局WorkerPool实例
 */
export function destroyWorkerPool(): void {
  if (globalPool) {
    globalPool.terminate();
    globalPool = null;
  }
}
