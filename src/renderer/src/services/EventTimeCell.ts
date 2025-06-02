import { ActivityEvent } from '@shared/data/ActivityEvent';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import { EventEntry } from '@shared/data/EventEntry';
import { GitHubEvent } from '@shared/data/GitHubEvent';
import { addMinutes, differenceInMinutes } from 'date-fns';
import GitHubIcon from '@mui/icons-material/GitHub';
import React from 'react';

// イベント枠の最小高さ＝30分
const MIN_EVENT_CELL_HEIGHT = 30;

// GitHubイベントの最小高さ＝30分
// GitHubアイコンの高さが30分くらいの高さがないと欠けるので
const GITHUB_EVENT_CELL_HEIGHT = 30;

/**
 * `TSelf` には、継承先のクラスをそのまま入れる。
 * `copy` など、自身と同じ型を返すメソッドのために必要。
 */
export abstract class EventTimeCell<TEvent, TSelf extends EventTimeCell<TEvent, TSelf>> {
  private _overlappingIndex = 0;
  private _overlappingCount = 0;
  private _cellFrameEnd: Date;

  constructor(readonly startTime: Date, readonly endTime: Date, readonly event: TEvent) {
    // `cellFrameEnd`の計算
    // getter内で計算すると呼び出しの度に`Date`オブジェクトの参照が変わってReactのhookと相性が悪い
    // なので、コンストラクタで1回だけ計算する
    const mins = differenceInMinutes(endTime, startTime);
    if (mins < MIN_EVENT_CELL_HEIGHT) {
      this._cellFrameEnd = addMinutes(startTime, MIN_EVENT_CELL_HEIGHT);
    } else {
      this._cellFrameEnd = endTime;
    }
  }

  abstract get id(): string;
  abstract get summary(): string;
  abstract copy(): TSelf;

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
    return this._cellFrameEnd;
  }

  getDurationMin(): number {
    return differenceInMinutes(this.endTime, this.startTime);
  }
}

export abstract class EditableEventTimeCell<
  TEvent,
  TSelf extends EditableEventTimeCell<TEvent, TSelf>
> extends EventTimeCell<TEvent, TSelf> {
  constructor(readonly startTime: Date, readonly endTime: Date, readonly event: TEvent) {
    super(startTime, endTime, event);
  }
  abstract copy(): TSelf;
  abstract replaceStartTime(value: Date): TSelf;
  abstract replaceEndTime(value: Date): TSelf;
  abstract replaceTime(startTime: Date, endTime: Date): TSelf;
}

export class EventEntryTimeCell extends EditableEventTimeCell<EventEntry, EventEntryTimeCell> {
  constructor(readonly startTime: Date, readonly endTime: Date, readonly event: EventEntry) {
    super(startTime, endTime, event);
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

export class ActivityEventTimeCell extends EventTimeCell<ActivityEvent, ActivityEventTimeCell> {
  constructor(readonly startTime: Date, readonly endDateTime: Date, readonly event: ActivityEvent) {
    super(startTime, endDateTime, event);
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

export class GitHubEventTimeCell extends EventTimeCell<GitHubEvent, GitHubEventTimeCell> {
  private _summary: string | undefined;
  private _description: string | null | undefined;

  constructor(readonly startTime: Date, readonly endDateTime: Date, readonly event: GitHubEvent) {
    super(startTime, endDateTime, event);
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
        repository: 'リポジトリ',
      };
      let ref = 'unknown';
      if (refType) {
        if (refNames[refType]) {
          ref = refNames[refType];
        } else {
          ref = refType;
        }
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
      if (p.action === 'closed') {
        description = `${p.action} #${issue.number} ${issue.title}`;
      } else {
        description = `${p.action} #${issue.number} ${issue.title}: ${issue.body}`;
      }
    } else if (event.type === 'PullRequestEvent') {
      // Pull Requestに関連するアクティビティ
      // payload: ?
      const p = event.payload;
      const pr = p.pull_request as Record<string, unknown>;
      summary = `PR`;
      if (p.action === 'closed') {
        description = `${p.action} #${p.number} ${pr.title}`;
      } else {
        description = `${p.action} #${p.number} ${pr.title}: ${pr.body}`;
      }
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

    const eventTimeCell = new GitHubEventTimeCell(
      event.updated_at,
      addMinutes(event.updated_at, GITHUB_EVENT_CELL_HEIGHT),
      event
    );
    eventTimeCell._summary = summary;
    eventTimeCell._description = description;
    return eventTimeCell;
  }
}

export type ActivityLaneEventTimeCell = ActivityEventTimeCell | GitHubEventTimeCell;
