import rendererContainer from '../inversify.config';
import { Scheduler } from '@aldabil/react-scheduler';
import ja from 'date-fns/locale/ja';
import {
  DayHours,
  DefaultRecourse,
  EventActions,
  EventRendererProps,
  FieldProps,
  ProcessedEvent,
  ResourceFields,
} from '@aldabil/react-scheduler/types';
import { EVENT_TYPE_ITEMS } from '@shared/dto/ScheduleEvent';
import { TYPES } from '@renderer/types';
import { IScheduleEventProxy } from '@renderer/services/IScheduleEventProxy';
import { SelectOption } from '@aldabil/react-scheduler/components/inputs/SelectInput';

// スケジュール表のリソースヘッダーの次の行に表示するコンポーネント
// 時間のある予定は、時間のセルにあるが、時間のない予定は、ここに表示する
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ScheduleLaneHeader = (_day: Date): JSX.Element => {
  return <></>;
};

const START_HOUR = 6;
const END_HOUR = START_HOUR + 24;

const resources: DefaultRecourse[] = [];
for (const item of EVENT_TYPE_ITEMS) {
  resources.push({
    event_type: item.id,
    title: item.name,
  });
}
const resourceFields: ResourceFields = {
  idField: 'event_type',
  textField: 'title',
  // subTextField: 'title',
  avatarField: 'title',
  colorField: 'color',
};
const fields: FieldProps[] = [
  {
    name: 'event_type',
    type: 'select',
    default: resources[0].event_type,
    options: resources.map((res) => {
      return {
        id: res.event_type,
        text: res.title,
        value: res.event_type, //Should match "name" property
      } as SelectOption;
    }),
    config: { label: '予実', required: true },
  },
];

const translations = {
  navigation: {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    today: 'Today',
  },
  form: {
    addTitle: '追加',
    editTitle: '編集',
    confirm: '保存',
    delete: '削除',
    cancel: 'キャンセル',
  },
  event: {
    title: 'タイトル',
    start: '開始',
    end: '終了',
    allDay: 'All Day',
  },
  moreEvents: 'More...',
  loading: 'Loading...',
};

interface ScheduleTableProps {
  events: ProcessedEvent[];
}

const EventTimeTable = ({ events }: ScheduleTableProps): JSX.Element => {
  const handleConfirm = async (
    event: ProcessedEvent,
    action: EventActions
  ): Promise<ProcessedEvent> => {
    console.log('handleConfirm =', action, event);
    try {
      const scheduleEventProxy = rendererContainer.get<IScheduleEventProxy>(
        TYPES.ScheduleEventProxy
      );
      if (action === 'edit') {
        const id = `${event.event_id}`;
        const sEvent = await scheduleEventProxy.get(id);
        if (!sEvent) {
          throw new Error(`ScheduleEvent not found. id=${id}`);
        }
        sEvent.summary = event.title;
        sEvent.eventType = event.event_type;
        sEvent.start = event.start;
        sEvent.end = event.end;
        await scheduleEventProxy.save(sEvent);
      } else if (action === 'create') {
        const sEvent = await scheduleEventProxy.create(
          event.event_type,
          event.title,
          event.start,
          event.end
        );
        await scheduleEventProxy.save(sEvent);
      }
      return event;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDelete = async (deletedId: string): Promise<string> => {
    console.log('handleDelete =', deletedId);
    try {
      const scheduleEventProxy = rendererContainer.get<IScheduleEventProxy>(
        TYPES.ScheduleEventProxy
      );
      scheduleEventProxy.delete(deletedId);
      return deletedId;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <Scheduler
      // ref={calendarRef}
      locale={ja}
      view="day"
      disableViewNavigator={true}
      hourFormat="24"
      // height={800}
      day={{
        startHour: START_HOUR,
        endHour: END_HOUR as DayHours,
        step: 60,
        // cellRenderer?:(props: CellProps) => JSX.Element,
        headRenderer: ScheduleLaneHeader,
        navigation: true,
      }}
      resources={resources}
      resourceFields={resourceFields}
      fields={fields}
      // viewerExtraComponent={ViewerExtraComponent}
      events={events}
      translations={translations}
      onConfirm={handleConfirm}
      onDelete={handleDelete}
      eventRenderer={({ event }: EventRendererProps): JSX.Element | null => {
        if (event.event_type == 'ACTIVITY') {
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                background: '#757575',
              }}
            >
              <div style={{ height: 20, background: '#ffffffb5', color: 'black' }}>
                {event.start.toLocaleTimeString('en-US', {
                  timeStyle: 'short',
                })}{' '}
                {event.end.toLocaleTimeString('en-US', { timeStyle: 'short' })}
                {event.title}
              </div>
            </div>
          );
        }
        return null;
      }}
    />
  );
};

export default EventTimeTable;
