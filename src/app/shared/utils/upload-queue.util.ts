/**
 * Processes items in batches with a given concurrency limit.
 * Uses Promise.allSettled to process items in parallel without halting on individual errors.
 * 
 * @param items Items to process
 * @param concurrency Maximum parallel executions
 * @param processor Function to process a single item
 */
export async function processInBatches<T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const promises = batch.map(item => processor(item));
    const batchResults = await Promise.allSettled(promises);
    results.push(...batchResults);
  }

  return results;
}
