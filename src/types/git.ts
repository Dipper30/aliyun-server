export type Git = any;

export namespace Github {
  export type RepoInfo = {};

  export type Workflow = {
    id: number;
    node_id: string; //"W_kwDOO3Hh2M4J-ZwO"
    name: string;
    path: string; //".github/workflows/blank.yml"
    state: 'active';
    created_at: Date;
    updated_at: Date;
    url: string; // "https://api.github.com/repos/https-github-com-Dipper30/node-demo/actions/workflows/167353358"
    html_url: string; // "https://github.com/https-github-com-Dipper30/node-demo/blob/master/.github/workflows/blank.yml"
    badge_url: string; // "https://github.com/https-github-com-Dipper30/node-demo/workflows/CI/badge.svg
  };

  // CI/CD related types
  export type WorkflowRun = {
    id: number;
    name?: string | null;
    status: 'queued' | 'in_progress' | 'completed' | 'waiting' | 'requested';
    conclusion:
      | 'success'
      | 'failure'
      | 'neutral'
      | 'cancelled'
      | 'timed_out'
      | 'action_required'
      | 'stale'
      | null;
    created_at: string;
    updated_at: string;
    head_branch: string | null;
    head_sha: string;
    workflow_id: number;
    repository: {
      name: string;
      full_name: string;
    };
  };
  export type WorkflowRunJob = {
    id: number;
    name?: string | null;
    status: 'queued' | 'in_progress' | 'completed' | 'waiting' | 'requested';
    conclusion:
      | 'success'
      | 'failure'
      | 'neutral'
      | 'cancelled'
      | 'timed_out'
      | 'action_required'
      | 'stale'
      | null;
    created_at: string;
    updated_at: string;
    head_branch: string | null;
    head_sha: string;
    workflow_id: number;
    repository: {
      name: string;
      full_name: string;
    };
  };

  export type WorkflowRunJobStep = {
    name: string;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion:
      | 'success'
      | 'failure'
      | 'neutral'
      | 'cancelled'
      | 'skipped'
      | 'action_required'
      | 'stale';
    number: number;
    started_at: string; // ISO 格式日期
    completed_at: string; // ISO 格式日期
  };
}
