import { WorkAnalysis } from '@renderer/components/WorkAnalysis/WorkAnalysis';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('WorkAnalysisPage');

export const WorkAnalysisPage = (): JSX.Element => {
  logger.info('WorkAnalysisPage');
  return <WorkAnalysis />;
};
