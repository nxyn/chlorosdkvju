// Types based on Jules API concepts
export interface JulesSession {
  name: string; // The full resource name, e.g., "sessions/123"
  id?: string; // Convenience field
  sourceContext?: {
    source: string;
    githubRepoContext?: {
      startingBranch: string;
      repoUrl?: string;
    };
  };
  prompt?: string; // The initial prompt
  state?: 'STATE_UNSPECIFIED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createTime?: string;
  title?: string;
}

export interface JulesActivity {
  name: string;
  type: string; // e.g., "code_generation", "message"
  content?: string;
  createTime?: string;
  metadata?: any;
}

export interface JulesMessage {
  role: 'user' | 'agent';
  content: string;
}

export interface JulesSource {
    name: string; // sources/github/owner/repo
    displayName?: string;
}

class JulesClient {
  private apiKey: string;
  private baseUrl = 'https://jules.googleapis.com/v1alpha';

  constructor(apiKey?: string) {
    // Use the provided test key as default if no other key is present
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_JULES_API_KEY || 'AQ.Ab8RN6JPovgJrbg8GoKxLXGZMXjGNDALQqU6T7zaEpMM8PRorA';
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey,
    };
  }

  async listSources(): Promise<JulesSource[]> {
    if (!this.apiKey) throw new Error("API Key not set");
    
    try {
        const response = await fetch(`${this.baseUrl}/sources`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const error = await response.text();
            console.warn(`Failed to list sources (non-fatal): ${error}`);
            return [];
        }

        const data = await response.json();
        return data.sources || [];
    } catch (e) {
        console.warn("Network error listing sources", e);
        return [];
    }
  }

  async createSession(
      prompt: string, 
      owner: string = process.env.NEXT_PUBLIC_GITHUB_OWNER || 'google',
      repo: string = process.env.NEXT_PUBLIC_GITHUB_REPO || 'jules-samples',
      branch: string = 'main'
    ): Promise<JulesSession> {
    if (!this.apiKey) throw new Error("API Key not set");

    // Construct the source resource name. 
    // NOTE: This source must generally exist or be accessible to the API key user.
    // For testing, we default to 'google/jules-samples'.
    const sourceResourceName = `sources/github/${owner}/${repo}`;
    
    console.log("Creating Jules Session with source:", sourceResourceName);

    const payload = {
        prompt: prompt,
        sourceContext: {
            source: sourceResourceName,
            githubRepoContext: {
                startingBranch: branch
            }
        },
        title: prompt.substring(0, 50),
        // automationMode: "AUTO_CREATE_PR" 
    };

    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Jules API Create Session Failed:", response.status, errorText);
      throw new Error(`Failed to create session (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log("Jules Session Created:", data);
    
    return {
      ...data,
      id: data.name.split('/').pop(),
    };
  }

  async sendMessage(sessionId: string, message: string): Promise<JulesActivity> {
    if (!this.apiKey) throw new Error("API Key not set");
    
    // Ensure session path is full resource name
    const sessionPath = sessionId.includes('/') ? sessionId : `sessions/${sessionId}`;

    console.log(`Sending message to ${sessionPath}...`);

    const response = await fetch(`${this.baseUrl}/${sessionPath}:sendMessage`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        prompt: message
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Jules API Send Message Failed:", response.status, errorText);
      throw new Error(`Failed to send message (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log("Jules Message Response:", data);
    
    // Robust content extraction from various potential API response shapes
    let content = "No content returned.";
    
    if (data.response) {
        content = data.response;
    } else if (data.text) {
        content = data.text;
    } else if (data.content) {
        content = data.content;
    } else if (typeof data === 'string') {
        content = data;
    } else {
        // Fallback to stringified data if structure is unknown
        content = JSON.stringify(data, null, 2);
    }
    
    return {
      name: `sessions/${sessionId}/activities/latest`,
      type: 'message',
      content: content,
      createTime: new Date().toISOString(),
      metadata: data
    };
  }
}

export const julesApi = new JulesClient();
