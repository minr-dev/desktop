import { inject, injectable } from 'inversify';

import { TYPES } from '@main/types';
import type { IAuthService } from './IAuthService';
import { IGitHubService } from './IGitHubService';
import { GitHubEvent } from '@shared/dto/GitHubEvent';
import axios, { AxiosHeaders } from 'axios';
import type { ICredentialsStoreService } from './ICredentialsStoreService';
import { GitHubCredentials } from '@shared/dto/GitHubCredentials';
import type { IUserDetailsService } from './IUserDetailsService';

/**
 * GitHub APIを実行するサービス
 */
@injectable()
export class GitHubServiceImpl implements IGitHubService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.GitHubAuthService)
    private readonly githubAuthService: IAuthService,
    @inject(TYPES.GitHubCredentialsStoreService)
    private readonly githubCredentialsService: ICredentialsStoreService<GitHubCredentials>
  ) {}

  async fetchEvents(until: Date): Promise<GitHubEvent[]> {
    const credentials = await this.githubCredentialsService.get(
      await this.userDetailsService.getUserId()
    );
    if (!credentials) {
      throw new Error('credentials is null');
    }
    const url = `https://api.github.com/users/${credentials.login}/events`;
    try {
      const headers = await this.createHeader();
      const pageSize = 30;
      const params = {
        page: 1,
        per_page: pageSize,
      };
      const results: GitHubEvent[] = [];
      let hasMore = true;
      while (hasMore) {
        console.log('GitHub Events:', url, { headers, params });
        const response = await axios.get<GitHubEvent[]>(url, { headers, params });
        console.log('Fetched GitHub Events:', response.data);
        for (const event of response.data) {
          console.log(event);
          if (event.created_at) {
            event.created_at = new Date(event.created_at);
          }
          if (!event.created_at || event.created_at < until) {
            break;
          }
          results.push(event);
        }
        if (response.data.length === pageSize) {
          params.page++;
        } else {
          hasMore = false;
        }
      }
      return results;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(`Error: ${error.response?.status}`);
      } else {
        console.error('An unknown error occurred.');
      }
      throw error;
    }
  }

  private async createHeader(): Promise<AxiosHeaders> {
    const accessToken = await this.githubAuthService.getAccessToken();
    if (!accessToken) {
      throw new Error('accessToken is null');
    }
    return new AxiosHeaders({
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    });
  }
}
