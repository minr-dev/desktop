# minr-desktop

`MINR Desktop` は、PC を使って仕事をしている人たちの Desktop での作業をサポートするためのツールです。

Electron と React(MUI) で作り込まれています。

## 標準機能

### 予実管理

#### 予実一覧

一日分の予定と実績およびアクティビティを一覧表示する。

> ※ **アクティビティ**とは？
>
> アクティブな Window タイトルをロギングしたもので、
> 実績の記録をするときに、作業を思い出すために使用することを想定したものである。
>
> アクティブな Window タイトルは、60 秒間隔で回収が行われて、変化があったときに、ロギングされる。
> 保存先は、ローカルディスク内の DB である。

このログが、予実一覧のアクティビティに表示される。

#### 予定と実績の登録

- 予定は、朝一、あるいは、前日の作業終了時に、入力することを想定している
- 実績の登録も、予定の登録のタイミングで、前日あるいは、当日をふりかえって入力することを想定している

### プロジェクト管理

- プロジェクトの登録 (未実装 #19)

### GitHub 連携

- GitHub Issue / PR 連動 (未実装 #18)
- GitHub とプロジェクトの連動 (未実装 #18)

### Google カレンダーとの同期

- Google カレンダーとの同期

### 音声通知

- 予定時刻の音声通知
- 時報の音声通知

## 不十分なこと

- エラー処理

  - 全体的なエラー処理の統一ルールがない
  - Google のアクセスキーが不正なときのエラーが不適切（カレンダー ID が無いというエラーになっちゃう）

- ロガー未実装

## 開発

### データの永続化

永続化は、main プロセスに実装し、renderer プロセスからは、IPC でメッセージを送信する。
例えば、保存処理の流れは、次のとおりである。

- renderer プロセスで「保存」ボタン押下
- クリックイベントで、 XxxxProxy の保存処理を呼び出す
- XxxxProxy では、保存データを IPC のメッセージにして、送信する
- main プロセス側の IPC ハンドラーでメッセージを受信する
- IPC ハンドラーで、XxxxService の保存処理を呼び出す

作成するクラスは、ちょっと、コマゴマとたくさんある。

-
