import { PlanTemplate } from '@shared/data/PlanTemplate';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';

interface PlanTemplateEditProps {
  isOpen: boolean;
  templateId: string | null;
  onClose: () => void;
  onSubmit: (planTemplate: PlanTemplate, events: PlanTemplateEvent[]) => void;
}

export const PlanTemplateEdit = ({
  isOpen,
  templateId,
  onClose,
  onSubmit,
}: PlanTemplateEditProps): JSX.Element => {
  throw new Error('not implemented.');
};
