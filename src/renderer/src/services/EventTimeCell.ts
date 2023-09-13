import { ActivityEvent } from '@shared/data/ActivityEvent';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import { EventEntry } from '@shared/data/EventEntry';
import { GitHubEvent } from '@shared/data/GitHubEvent';
import { addMinutes, differenceInMinutes } from 'date-fns';
import GitHubIcon from '@mui/icons-material/GitHub';
import React from 'react';

export abstract class EventTimeCell {
  private _overlappingIndex = 0;
  private _overlappingCount = 0;

  constructor(readonly startTime: Date, readonly endTime: Date) {}

  abstract get id(): string;
  abstract get summary(): string;
  abstract copy(): EventTimeCell;

  get description(): string | null | undefined {
    return undefined;
  }

  get backgroundColor(): string | null {
    throw new Error('not implemented');
  }

  get icon(): React.ReactElement | undefined {
    return undefined;
  }

  get overlappingIndex(): number {
    return this._overlappingIndex;
  }

  set overlappingIndex(value: number) {
    this._overlappingIndex = value;
  }

  get overlappingCount(): number {
    return this._overlappingCount;
  }

  set overlappingCount(value: number) {
    this._overlappingCount = value;
  }

  get cellFrameStart(): Date {
    return this.startTime;
  }

  get cellFrameEnd(): Date {
    let mins = differenceInMinutes(this.endTime, this.startTime);
    if (mins < 15) {
      mins = 15;
      const endTime = addMinutes(this.startTime, mins);
      return endTime;
    }
    return this.endTime;
  }
}

export class EventEntryTimeCell extends EventTimeCell {
  constructor(readonly startTime: Date, readonly endTime: Date, readonly event: EventEntry) {
    super(startTime, endTime);
  }

  get id(): string {
    return this.event.id;
  }

  get summary(): string {
    return this.event.summary;
  }

  get description(): string | null | undefined {
    return this.event.description;
  }

  replaceStartTime(value: Date): EventEntryTimeCell {
    const event = { ...this.event, start: { dateTime: value } };
    return new EventEntryTimeCell(value, this.endTime, event);
  }

  replaceEndTime(value: Date): EventEntryTimeCell {
    const event = { ...this.event, end: { dateTime: value } };
    return new EventEntryTimeCell(this.startTime, value, event);
  }

  replaceTime(startTime: Date, endTime: Date): EventEntryTimeCell {
    const event = { ...this.event, start: { dateTime: startTime }, end: { dateTime: endTime } };
    return new EventEntryTimeCell(startTime, endTime, event);
  }

  copy(): EventEntryTimeCell {
    return new EventEntryTimeCell(this.startTime, this.endTime, this.event);
  }

  static fromEventEntry(eventEntry: EventEntry): EventEntryTimeCell {
    return new EventEntryTimeCell(
      eventDateTimeToDate(eventEntry.start),
      eventDateTimeToDate(eventEntry.end),
      eventEntry
    );
  }
}

export class ActivityEventTimeCell extends EventTimeCell {
  constructor(readonly startTime: Date, readonly endDateTime: Date, readonly event: ActivityEvent) {
    super(startTime, endDateTime);
  }

  get id(): string {
    return this.event.id;
  }

  get summary(): string {
    return this.event.basename;
  }

  get description(): string | null | undefined {
    return this.event.details.join('\n');
  }

  get backgroundColor(): string | null {
    return this.event.appColor;
  }

  copy(): ActivityEventTimeCell {
    return new ActivityEventTimeCell(this.startTime, this.endDateTime, this.event);
  }

  static fromActivityEvent(event: ActivityEvent): ActivityEventTimeCell {
    return new ActivityEventTimeCell(event.start, event.end, event);
  }
}

export class GitHubEventTimeCell extends EventTimeCell {
  private _summary: string | undefined;
  private _description: string | null | undefined;

  constructor(readonly startTime: Date, readonly endDateTime: Date, readonly event: GitHubEvent) {
    super(startTime, endDateTime);
  }

  get id(): string {
    return this.event.id;
  }

  get summary(): string {
    return this._summary || '';
  }

  get description(): string | null | undefined {
    return this._description;
  }

  get backgroundColor(): string {
    return '#F6F8FA';
  }

  get icon(): React.ReactElement | undefined {
    return React.createElement(GitHubIcon);
  }

  copy(): GitHubEventTimeCell {
    return new GitHubEventTimeCell(this.startTime, this.endDateTime, this.event);
  }

  static fromGitHubEvent(event: GitHubEvent): GitHubEventTimeCell {
    let summary = '';
    let description: string | undefined = '';

    const convRefTypeName = (): string => {
      const p = event.payload;
      const refType = p.ref_type as string | undefined;
      const refNames = {
        branch: 'ブランチ',
        tag: 'タグ',
      };
      let ref = 'unknown';
      if (refType && refNames[refType]) {
        ref = refNames[refType];
      }
      return ref;
    };

    if (event.type === 'CommitCommentEvent') {
      // コミットコメントが作成されました
      // payload: {action: 'created', comment: 'xxx'}
      const p = event.payload;
      const comment = p.comment as Record<string, unknown>;
      if (p.action === 'created') {
        summary = `コミットコメントが作成された`;
      } else {
        summary = `コミットコメントが ${p.action}`;
      }
      description = `${comment.body}`;
    } else if (event.type === 'CreateEvent') {
      // ブランチ、またはタグが作成されました
      // payload: {ref: 'feature/74/github-activity/main', ref_type: 'branch', master_branch: 'develop', description: null, pusher_type: 'user'}
      const p = event.payload;
      const refTypeName = convRefTypeName();
      summary = `${refTypeName}作成`;
      description = `${refTypeName}名: ${p.ref}`;
    } else if (event.type === 'DeleteEvent') {
      // ブランチまたはタグが削除されました
      // payload: {ref: 'feature/15/ci', ref_type: 'branch', pusher_type: 'user'}
      const p = event.payload;
      const refTypeName = convRefTypeName();
      summary = `${refTypeName}削除`;
      description = `${refTypeName}名: ${p.ref}`;
    } else if (event.type === 'ForkEvent') {
      // ユーザがリポジトリをフォークしました
      // payload: ?
      const p = event.payload;
      summary = `フォーク`;
      description = `${p.forkee}`;
    } else if (event.type === 'GollumEvent') {
      // wikiページが作成もしくは更新されました
      // payload: ?
      const p = event.payload;
      summary = `wikiページ`;
      description = JSON.stringify(p);
    } else if (event.type === 'IssuesEvent') {
      // Issueに関連するアクティビティ
      // payload: ?
      const p = event.payload;
      const issue = p.issue as Record<string, unknown>;
      summary = `Issue`;
      description = `${p.action} #${issue.number} ${issue.title}: ${issue.body}`;
    } else if (event.type === 'PullRequestEvent') {
      // Pull Requestに関連するアクティビティ
      // payload: ?
      const p = event.payload;
      const pr = p.pull_request as Record<string, unknown>;
      summary = `PR`;
      description = `${p.action} #${p.number} ${pr.title}: ${pr.body}`;
    } else if (event.type === 'PullRequestReviewCommentEvent') {
      // Pull Requestの統合diff中のPull Requestレビューコメントに関連するアクティビティ
      // payload: ?
      const p = event.payload;
      const pr = p.pull_request as Record<string, unknown>;
      const comment = p.comment as Record<string, unknown>;
      summary = `PR コメント`;
      description = `${p.action} #${p.number} ${pr.title}: ${comment.body}`;
    } else if (event.type === 'PullRequestReviewThreadEvent') {
      // 解決済みまたは未解決とマークされている pull request のコメント スレッドに関連するアクティビティ
      // payload: ?
      const p = event.payload;
      const pr = p.pull_request as Record<string, unknown>;
      const thread = p.thread as Record<string, unknown>;
      summary = `PR コメント スレッド`;
      description = `${p.action} #${p.number} ${pr.title}: ${JSON.stringify(thread)}`;
    } else if (event.type === 'PushEvent') {
      // リポジトリのブランチもしくはタグに、1つ以上のコミットがプッシュされました
      // payload: ?
      const p = event.payload;
      const commits = p.commits as Record<string, unknown>[];
      const commitMessages = commits.map((c) => c.message);
      summary = `Push`;
      description = `${p.ref}: ${commitMessages.join('\n')}`;
    } else if (event.type === 'ReleaseEvent') {
      // リリースに関連するアクティビティ
      // payload: ?
      const p = event.payload;
      const release = p.release as Record<string, unknown>;
      summary = `Release`;
      description = `${p.action} ${release.name} ${release.body}`;
    } else {
      summary = event.type;
      const p = event.payload;
      description = JSON.stringify(p);
    }
    // GitHubアイコンの高さが30分くらいの高さがないと欠けるので、
    // GitHubイベントは30分で表示する
    const eventTimeCell = new GitHubEventTimeCell(
      event.updated_at,
      addMinutes(event.updated_at, 30),
      event
    );
    eventTimeCell._summary = summary;
    eventTimeCell._description = description;
    return eventTimeCell;
  }
}
