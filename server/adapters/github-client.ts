import { GitConfig } from "@shared/schema";

export interface GitHubRef {
  ref: string;
  object: {
    sha: string;
    type: string;
    url: string;
  };
}

export interface GitHubBlob {
  sha: string;
  url: string;
}

export interface GitHubTreeEntry {
  path: string;
  mode: "100644" | "100755" | "040000" | "160000" | "120000";
  type: "blob" | "tree" | "commit";
  sha: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeEntry[];
}

export interface GitHubCommit {
  sha: string;
  url: string;
  message: string;
}

export interface GitHubRefUpdate {
  ref: string;
  object: {
    sha: string;
    type: string;
  };
}

export interface GitHubPullRequest {
  number: number;
  html_url: string;
  title: string;
  state: string;
}

export interface FileEntry {
  path: string;
  content: Buffer;
  mode?: "100644" | "100755";
}

export class GitHubClient {
  private baseUrl = "https://api.github.com";
  private token: string;
  private owner: string;
  private repo: string;

  constructor(config: GitConfig) {
    this.token = config.auth.token;
    const [owner, repo] = config.repo.split("/");
    if (!owner || !repo) {
      throw new Error(`Invalid repo format: ${config.repo}. Expected "owner/repo"`);
    }
    this.owner = owner;
    this.repo = repo;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  async getRef(branch: string): Promise<GitHubRef> {
    return this.request<GitHubRef>(
      "GET",
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${branch}`
    );
  }

  async createBlob(content: Buffer): Promise<GitHubBlob> {
    return this.request<GitHubBlob>(
      "POST",
      `/repos/${this.owner}/${this.repo}/git/blobs`,
      {
        content: content.toString("base64"),
        encoding: "base64",
      }
    );
  }

  async createTree(
    baseTreeSha: string,
    entries: GitHubTreeEntry[]
  ): Promise<GitHubTree> {
    return this.request<GitHubTree>(
      "POST",
      `/repos/${this.owner}/${this.repo}/git/trees`,
      {
        base_tree: baseTreeSha,
        tree: entries,
      }
    );
  }

  async getCommit(sha: string): Promise<{ tree: { sha: string } }> {
    return this.request<{ tree: { sha: string } }>(
      "GET",
      `/repos/${this.owner}/${this.repo}/git/commits/${sha}`
    );
  }

  async createCommit(
    message: string,
    treeSha: string,
    parentSha: string
  ): Promise<GitHubCommit> {
    return this.request<GitHubCommit>(
      "POST",
      `/repos/${this.owner}/${this.repo}/git/commits`,
      {
        message,
        tree: treeSha,
        parents: [parentSha],
      }
    );
  }

  async updateRef(branch: string, sha: string): Promise<GitHubRefUpdate> {
    return this.request<GitHubRefUpdate>(
      "PATCH",
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${branch}`,
      {
        sha,
        force: false,
      }
    );
  }

  async branchExists(branch: string): Promise<boolean> {
    try {
      await this.getRef(branch);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      throw error;
    }
  }

  async createBranch(baseBranch: string, newBranch: string): Promise<GitHubRef> {
    const baseRef = await this.getRef(baseBranch);
    return this.request<GitHubRef>(
      "POST",
      `/repos/${this.owner}/${this.repo}/git/refs`,
      {
        ref: `refs/heads/${newBranch}`,
        sha: baseRef.object.sha,
      }
    );
  }

  async createOrUpdateBranch(baseBranch: string, newBranch: string): Promise<GitHubRef> {
    const exists = await this.branchExists(newBranch);
    if (exists) {
      const baseRef = await this.getRef(baseBranch);
      await this.updateRef(newBranch, baseRef.object.sha);
      return this.getRef(newBranch);
    }
    return this.createBranch(baseBranch, newBranch);
  }

  async createPullRequest(
    title: string,
    body: string,
    head: string,
    base: string
  ): Promise<GitHubPullRequest> {
    return this.request<GitHubPullRequest>(
      "POST",
      `/repos/${this.owner}/${this.repo}/pulls`,
      {
        title,
        body,
        head,
        base,
      }
    );
  }

  async pushFiles(
    branch: string,
    files: FileEntry[],
    message: string,
    pathPrefix?: string
  ): Promise<{ commitSha: string }> {
    const ref = await this.getRef(branch);
    const headCommitSha = ref.object.sha;
    
    const headCommit = await this.getCommit(headCommitSha);
    const baseTreeSha = headCommit.tree.sha;

    const treeEntries: GitHubTreeEntry[] = [];
    
    for (const file of files) {
      const blob = await this.createBlob(file.content);
      const fullPath = pathPrefix 
        ? `${pathPrefix.replace(/^\/|\/$/g, "")}/${file.path}`
        : file.path;
      
      treeEntries.push({
        path: fullPath,
        mode: file.mode || "100644",
        type: "blob",
        sha: blob.sha,
      });
    }

    const newTree = await this.createTree(baseTreeSha, treeEntries);
    
    const commit = await this.createCommit(message, newTree.sha, headCommitSha);
    
    await this.updateRef(branch, commit.sha);

    return { commitSha: commit.sha };
  }

  async pushFilesAsPR(
    baseBranch: string,
    prBranch: string,
    files: FileEntry[],
    title: string,
    body: string,
    pathPrefix?: string
  ): Promise<{ prUrl: string; prNumber: number; commitSha: string }> {
    await this.createOrUpdateBranch(baseBranch, prBranch);
    
    const { commitSha } = await this.pushFiles(prBranch, files, title, pathPrefix);
    
    const pr = await this.createPullRequest(title, body, prBranch, baseBranch);

    return {
      prUrl: pr.html_url,
      prNumber: pr.number,
      commitSha,
    };
  }
}

export function sanitizePath(entryPath: string): string | null {
  let cleaned = entryPath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\.\.\/|\.\.$/g, "");
  
  const segments = cleaned.split("/").filter(s => s && s !== "." && s !== "..");
  if (segments.length === 0) {
    return null;
  }
  
  return segments.join("/");
}
