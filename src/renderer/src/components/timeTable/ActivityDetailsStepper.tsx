import { Typography, Box } from '@mui/material';
import { ActivityEvent } from '@shared/data/ActivityEvent';
import { format } from 'date-fns';

interface ActivityDetailsStepperProps {
  activeStep: number;
  steps: ActivityEvent[];
}

// const MyStepIcon = ({ active, completed }: StepIconProps): JSX.Element => {
//   if (active) {
//     return <div>🟢</div>;
//   }
//   if (completed) {
//     return <div>🔵</div>;
//   }
//   return <div>🔵</div>;
// };

// const ActivityDetailsStepper2 = ({
//   activeStep,
//   steps: steps,
// }: ActivityDetailsStepperProps): JSX.Element => (
//   <Stepper activeStep={activeStep} orientation="vertical">
//     {steps.map((event) => {
//       const label = `${format(event.start, 'HH:mm')} ${event.title}`;
//       return (
//         <Step key={event.event_id}>
//           <StepLabel StepIconComponent={MyStepIcon}>{label}</StepLabel>
//           <StepContent>
//             <Typography>{event.description}</Typography>
//           </StepContent>
//         </Step>
//       );
//     })}
//   </Stepper>
// );

const ActivityDetailsStepper = ({
  activeStep,
  steps,
}: ActivityDetailsStepperProps): JSX.Element => (
  <Box>
    {steps.map((event, index) => {
      const icon = index === activeStep ? '🟢' : '🔵';
      const label = `${icon} ${format(event.start, 'HH:mm')} ${event.basename}`;
      return (
        <Box key={event.id}>
          <Typography variant="h6">{label}</Typography>
          {event.details.map((detail) => {
            return (
              <Typography
                key={detail.id}
                variant="body1"
                sx={{
                  paddingLeft: '2rem',
                  // whiteSpace: 'nowrap',
                  // overflow: 'hidden',
                  // textOverflow: 'ellipsis',
                }}
              >
                {detail.windowTitle}
              </Typography>
            );
          })}
          {/* <Typography
            variant="body1"
            sx={{
              paddingLeft: '1rem',
              // whiteSpace: 'nowrap',
              // overflow: 'hidden',
              // textOverflow: 'ellipsis',
            }}
          >
            {event.description}
          </Typography> */}
        </Box>
      );
    })}
  </Box>
);
export default ActivityDetailsStepper;
