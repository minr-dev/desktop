import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function DownloadSection() {
  return (
    <section className={styles.downloadSection}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <div className="text--center">
              <Heading as="h2">MINR desktopをダウンロード</Heading>
              <p className="margin-bottom--lg">
                Windows、macOS に対応しています。最新版をダウンロードしてお使いください。
              </p>
              <div className={styles.downloadButtons}>
                <Link
                  className="button button--primary button--lg margin--sm"
                  href="https://github.com/minr-dev/desktop/releases/latest">
                  最新版をダウンロード
                </Link>
                <Link
                  className="button button--outline button--secondary button--lg margin--sm"
                  href="https://github.com/minr-dev/desktop/releases">
                  すべてのリリースを見る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            href="https://github.com/minr-dev/desktop/releases/latest">
            ダウンロード 📥
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            マニュアル 📘
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <DownloadSection />
      </main>
    </Layout>
  );
}
