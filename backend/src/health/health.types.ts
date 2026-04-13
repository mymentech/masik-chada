export interface DependencyCheck {
  status: 'ok' | 'fail';
  latencyMs?: number;
}

export interface LivenessResponse {
  status: 'ok';
  service: string;
  time: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  service: string;
  checks: {
    db: DependencyCheck;
    config: DependencyCheck;
    cron: DependencyCheck;
  };
  time: string;
}
