import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '自動スケジュール作成',
    Svg: require('@site/static/img/undraw_schedule-meeting.svg').default,
    description: (
      <>
        タスクを登録するだけで、空いている時間帯に予定を自動で配置。
        優先度や期限を考慮して、効率的なスケジュールを自動生成します。
      </>
    ),
  },
  {
    title: 'アクティビティ自動記録',
    Svg: require('@site/static/img/undraw_activity-tracker.svg').default,
    description: (
      <>
        PCでのアプリ使用状況を自動で記録し、後から何の作業をしていたか
        簡単に振り返ることができます。手動入力の手間を削減します。
      </>
    ),
  },
  {
    title: '視覚的な分析・振り返り',
    Svg: require('@site/static/img/undraw_data-analysis.svg').default,
    description: (
      <>
        予定と実績をグラフで比較表示し、時間の使い方を視覚的に分析。
        プロジェクト別・カテゴリー別の工数分析で作業習慣を改善できます。
      </>
    ),
  },
  {
    title: '外部サービス連携',
    Svg: require('@site/static/img/undraw_synchronize.svg').default,
    description: (
      <>
        Google カレンダーやGitHubと連携して、外部の予定やタスクをMINRで
        一元管理。すべての作業情報を統合して効率的に管理できます。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
