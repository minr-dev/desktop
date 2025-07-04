---
sidebar_position: 7
---

# ポモドーロタイマーを使う

MINR には、集中作業をサポートするためのポモドーロタイマー機能が搭載されています。

## ポモドーロタイマーとは？

25 分の作業と 5 分の休憩を 1 セットとし、これを繰り返すことで集中力を高める時間管理手法です。
MINR ではこのサイクルを活用して、作業のペースを作りやすくすることができます。

## タイマーの起動

1. 「ポモドーロタイマー」のページを開きます。
2. 左上の「スタート」ボタンを押すとタイマーが開始します。

## タイマーの動作

- 25 分間の作業時間がスタートします。
- 作業時間が終了すると自動的に休憩時間（5 分）に切り替わります。
- 作業と休憩のサイクルは連続して進行しますが、一時停止も可能です。
- MINR の他画面を開いていても、裏でタイマーは進行します。

## タイマー終了の通知

作業時間・休憩時間の終了時、及び終了の設定した分数前に、デスクトップ通知・音声読み上げを設定できます。

## タイマーの設定

設定ページのポモドーロタイマータブから、ポモドーロタイマーに関する設定を変更できます。

### 設定項目

- 作業時間・休憩時間: タイマーの時間を変更できます。
- セッション終了時・終了前の通知: タイマー終了に関する通知の設定を変更できます。
  - 音声で読み上げる/通知で送る: 音声読み上げを行うかデスクトップ通知を送るかを選択できます。両方行うことも可能です。
  - 通知タイミング(終了前のみ): 何分前に読み上げ・通知を行うかを指定します。
  - メッセージ: 音声読み上げ・デスクトップ通知でのメッセージを変更できます。
    - メッセージに `{SESSION}` を入れると、その部分が終了前のセッション(作業時間、休憩時間)の文字に置き換えられます。
    - メッセージに `{TIME}` を入れると、その部分がタイマーの残り時間に置き換えられます。

:::info
PC の言語設定が日本語でない場合などは、正常に読みあげされない可能性があります。
:::
