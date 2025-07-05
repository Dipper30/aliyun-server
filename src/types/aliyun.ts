/**
 * @remarks
 * The status of the instance. Valid values:
 *
 * *   Pending: The instance is being created.
 * *   Running: The instance is running.
 * *   Starting: The instance is being started.
 * *   Stopping: The instance is being stopped.
 * *   Stopped: The instance is stopped.
 *
 * @example
 * Running
 */
export type AliyunInstanceStatus =
  | 'Pending'
  | 'Running'
  | 'Starting'
  | 'Stopping'
  | 'Stopped';
