import { inject, injectable } from 'inversify';

import { TYPES } from '@main/types';
import type { IAuthService } from './IAuthService';
import { IGitHubService } from './IGitHubService';
import { GitHubEvent } from '@shared/data/GitHubEvent';
import axios, { AxiosHeaders } from 'axios';
import type { ICredentialsStoreService } from './ICredentialsStoreService';
import { GitHubCredentials } from '@shared/data/GitHubCredentials';
import type { IUserDetailsService } from './IUserDetailsService';
import { DateUtil } from '@shared/utils/DateUtil';
import { getLogger } from '@main/utils/LoggerUtil';
import { GraphQLClient } from 'graphql-request';
import {
  getSdk,
  ProjectV2ForSyncFragment as GraphQLProjectV2,
  OrganizationForSyncFragment as GraphQLOrganization,
  ProjectV2ItemForSyncFragment as GraphQLProjectV2Item,
} from '@main/dto/generated/graphql/types';
import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';
import { GitHubOrganization } from '@shared/data/GitHubOrganization';
import { GitHubProjectV2Item } from '@shared/data/GitHubProjectV2Item';

const logger = getLogger('GitHubServiceImpl');

type GraphQLSdk = ReturnType<typeof getSdk>;
type PageInfo = { hasNextPage: boolean; endCursor?: string | null };

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
    private readonly githubCredentialsService: ICredentialsStoreService<GitHubCredentials>,
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil
  ) {}

  private _graphQLSdk?: GraphQLSdk;

  private async getGraphQLSdk(): Promise<GraphQLSdk> {
    if (!this._graphQLSdk) {
      const client = new GraphQLClient('https://api.github.com/graphql', {
        headers: await this.createHeader(),
      });
      this._graphQLSdk = getSdk(client);
    }
    return this._graphQLSdk;
  }

  async fetchOrganizations(): Promise<GitHubOrganization[]> {
    const sdk = await this.getGraphQLSdk();
    const minr_user_id = await this.userDetailsService.getUserId();
    const credentials = await this.githubCredentialsService.get(minr_user_id);
    if (!credentials) {
      throw new Error('credentials is null');
    }

    const organizations: GitHubOrganization[] = [];
    try {
      const first = 10;
      let pageInfo: PageInfo = { hasNextPage: false };
      do {
        const res = await sdk.GetOrganizations({
          login: credentials.login,
          first,
          after: pageInfo.endCursor,
        });
        if (!res.user) {
          throw new Error('GitHub user was not found.');
        }
        const gqlOrganaizations = res.user.organizations.nodes?.filter((org) => org != null);
        if (!gqlOrganaizations) {
          break;
        }
        organizations.push(
          ...gqlOrganaizations.map(
            (gqlOrganization): GitHubOrganization =>
              this.convGitHubOrganization(gqlOrganization, minr_user_id)
          )
        );

        pageInfo = res.user.organizations.pageInfo;
        if (!pageInfo.endCursor) {
          throw new Error('endCursor was not found.');
        }
      } while (pageInfo.hasNextPage);
    } catch (e) {
      logger.error(e);
      throw e;
    }
    return organizations;
  }

  private convGitHubOrganization(
    gqlOrganization: GraphQLOrganization,
    minr_user_id: string
  ): GitHubOrganization {
    return {
      ...gqlOrganization,
      created_at: new Date(gqlOrganization.createdAt),
      updated_at: new Date(gqlOrganization.updatedAt),
      minr_user_id,
    };
  }

  async fetchProjectsV2(organizations: GitHubOrganization[]): Promise<GitHubProjectV2[]> {
    const projectsList = await Promise.all(
      organizations.map(this.fetchProjectsV2FromOrganization.bind(this))
    );
    return projectsList.flat();
  }

  private async fetchProjectsV2FromOrganization(
    organization: GitHubOrganization
  ): Promise<GitHubProjectV2[]> {
    const sdk = await this.getGraphQLSdk();
    const minr_user_id = await this.userDetailsService.getUserId();

    const projects: GitHubProjectV2[] = [];
    const first = 10;
    let pageInfo: PageInfo = { hasNextPage: false };
    do {
      const res = await sdk.GetProjectsV2FromOrganization({
        login: organization.login,
        first,
        after: pageInfo.endCursor,
      });
      if (!res.organization) {
        throw new Error('GitHub organization was not found.');
      }
      const gqlProjects = res.organization.projectsV2.nodes?.filter((org) => org != null);
      if (!gqlProjects) {
        break;
      }
      projects.push(
        ...gqlProjects.map(
          (gqlProject): GitHubProjectV2 =>
            this.convGitHubProjectV2(gqlProject, organization.login, minr_user_id)
        )
      );

      pageInfo = res.organization.projectsV2.pageInfo;
      if (!pageInfo.endCursor) {
        throw new Error('endCursor was not found.');
      }
    } while (pageInfo.hasNextPage);
    return projects;
  }

  private convGitHubProjectV2(
    gqlProject: GraphQLProjectV2,
    login: string,
    minr_user_id: string
  ): GitHubProjectV2 {
    return {
      ...gqlProject,
      // TODO: Organizationのリポジトリを作ったタイミングでIDに直す
      // fetchProjectV2Items で login が必要なので現状ではこうしているが、IDを元にリポジトリから拾う方が適切
      owner: login,
      created_at: new Date(gqlProject.createdAt),
      updated_at: new Date(gqlProject.updatedAt),
      minr_user_id,
    };
  }

  async fetchProjectV2Items(project: GitHubProjectV2): Promise<GitHubProjectV2Item[]> {
    const sdk = await this.getGraphQLSdk();
    const res = await sdk.GetProjectsV2ItemsFromOrganizationProject({
      login: project.owner,
      projectNumber: project.number,
      first: 50,
    });
    if (!res.organization || !res.organization.projectV2) {
      throw new Error('organization or projectV2 was not found.');
    }
    const items = res.organization.projectV2.items.nodes?.filter((item) => item != null);
    if (!items) {
      if (logger.isDebugEnabled()) logger.debug('item was not found.');
      return [];
    }
    const minr_user_id = await this.userDetailsService.getUserId();
    return items
      .map((gqlItem) => this.convGitHubProjectV2Item(gqlItem, project.id, minr_user_id))
      .filter((item): item is GitHubProjectV2Item => item != null);
  }

  private convGitHubProjectV2Item(
    gqlProjectItem: GraphQLProjectV2Item,
    projectId: string,
    minr_user_id: string
  ): GitHubProjectV2Item | null {
    if (!gqlProjectItem.content) {
      return null;
    }
    const fieldValues = gqlProjectItem.fieldValues.nodes?.filter((field) => field != null);
    const GitHubProjectV2ItemFieldValues = fieldValues
      ? fieldValues.flatMap((fieldValue) => {
          if (
            fieldValue.__typename == 'ProjectV2ItemFieldDateValue' ||
            fieldValue.__typename == 'ProjectV2ItemFieldIterationValue' ||
            fieldValue.__typename == 'ProjectV2ItemFieldNumberValue' ||
            fieldValue.__typename == 'ProjectV2ItemFieldSingleSelectValue' ||
            fieldValue.__typename == 'ProjectV2ItemFieldTextValue'
          ) {
            return [{ ...fieldValue, id: fieldValue.id, name: fieldValue.field.name }];
          } else {
            // TODO: 上記5つ以外のフィールド型も取得する
            return [];
          }
        })
      : [];
    const url =
      gqlProjectItem.content.__typename !== 'DraftIssue' ? gqlProjectItem.content.url : null;
    return {
      id: gqlProjectItem.content.id,
      title: gqlProjectItem.content.title,
      projectId: projectId,
      description: gqlProjectItem.content.bodyText,
      fieldValues: GitHubProjectV2ItemFieldValues,
      url,
      minr_user_id,
      created_at: new Date(gqlProjectItem.createdAt),
      updated_at: new Date(gqlProjectItem.updatedAt),
    };
  }

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
        if (logger.isDebugEnabled()) logger.debug('GitHub Events:', url, { headers, params });
        const response = await axios.get<GitHubEvent[]>(url, { headers, params });
        if (logger.isDebugEnabled()) logger.debug('Fetched GitHub Events:', response.data);
        for (const event of response.data) {
          if (logger.isDebugEnabled()) logger.debug(event);
          this.convGitHubEvent(event);
          if (event.updated_at && event.updated_at < until) {
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
      if (logger.isDebugEnabled()) logger.debug('GitHub Events:', results);
      return results;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error(`Error: ${error.response?.status}`);
      } else {
        logger.error('An unknown error occurred.');
      }
      throw error;
    }
  }

  private async convGitHubEvent(event: GitHubEvent): Promise<void> {
    event.minr_user_id = await this.userDetailsService.getUserId();
    if (event.created_at) {
      event.created_at = new Date(event.created_at);
    } else {
      event.created_at = this.dateUtil.getCurrentDate();
    }
    if (event.updated_at) {
      event.updated_at = new Date(event.updated_at);
    } else {
      event.updated_at = event.created_at;
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
