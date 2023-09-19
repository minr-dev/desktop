import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { TextField, Paper, Grid, FormControl, InputLabel } from '@mui/material';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { addHours, addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { TimePicker } from '@mui/x-date-pickers';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import { ProjectPulldownComponent } from '../project/ProjectPulldownComponent';
import { Project } from '@shared/data/Project';
import { ProjectEdit } from '../project/ProjectEdit';
import { Pageable } from '@shared/data/Page';
import { CategoryEdit } from '../category/CategoryEdit';
import { Category } from '@shared/data/Category';
import { CategoryPulldownComponent } from '../category/CategoryPulldownComponent';
import { LabelMultiSelectComponent } from '../label/LabelMultiSelectComponent';
import { LabelEdit } from '../label/LabelEdit';
import { Label } from '@shared/data/Label';

export const FORM_MODE = {
  NEW: 'NEW',
  EDIT: 'EDIT',
} as const;
export type FORM_MODE = (typeof FORM_MODE)[keyof typeof FORM_MODE];
export const FORM_MODE_ITEMS: { id: FORM_MODE; name: string }[] = [
  { id: FORM_MODE.NEW, name: '追加' },
  { id: FORM_MODE.EDIT, name: '編集' },
];

const DEFAULT_ORDER = 'updated';
const DEFAULT_SORT_DIRECTION = 'desc';
const DEFAULT_PAGE_SIZE = 10;

interface EventEntryFormProps {
  mode: FORM_MODE;
  eventType: EVENT_TYPE;
  targetDate: Date;
  startHour: number;
  initialValues?: EventEntry;
  onSubmit: SubmitHandler<EventEntry>;
}

/**
 * イベントの追加編集用のコンポーネント。
 *
 * TODO:
 * - プロジェクトのプルダウンの pageSize よりもデータが多いときにどうするかは要検討。
 * - 同じくソートの仕様も要検討。
 *
 * @param {ProjectPulldownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
const EventEntryForm = (
  { mode, eventType, targetDate, startHour = 0, initialValues, onSubmit }: EventEntryFormProps,
  ref: React.ForwardedRef<unknown>
): JSX.Element => {
  const formRef = useRef<HTMLFormElement>(null);

  const defaultValues = { ...initialValues };
  if (mode === FORM_MODE.NEW) {
    defaultValues.start = {
      dateTime: addHours(startOfDay(targetDate), startHour),
    };
    defaultValues.end = {
      dateTime: addHours(eventDateTimeToDate(defaultValues.start), 1),
    };
  }

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    // formState: { errors },
  } = useForm<EventEntry>({ defaultValues });
  // console.log('EventForm errors', errors);

  useImperativeHandle(ref, () => ({
    submit: (): void => {
      console.log('useImperativeHandle submit called');
      if (formRef.current) {
        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    },
  }));

  const start = useWatch({
    control,
    name: 'start',
    defaultValue: defaultValues.start,
  });

  // 開始時間を設定したら、変更前と同じ間隔で終了時間を自動修正する
  // 初期の開始時間と終了時間の間隔を分で計算
  if (!defaultValues.start || !defaultValues.end) {
    throw new Error('EventForm: defaultValues.start or defaultValues.end is undefined');
  }
  const initialInterval = differenceInMinutes(
    eventDateTimeToDate(defaultValues.end),
    eventDateTimeToDate(defaultValues.start)
  );
  useEffect(() => {
    if (start) {
      const newEndTime = {
        dateTime: addMinutes(eventDateTimeToDate(start), initialInterval),
        date: null,
      };
      setValue('end', newEndTime);
    }
  }, [initialInterval, start, mode, setValue]);

  const handleFormSubmit: SubmitHandler<EventEntry> = (data) => {
    console.log('EventForm handleFormSubmit called with:', data);
    const eventData = { ...data, eventType: eventType };
    onSubmit(eventData);
  };

  const [isProjectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectPageable, setProjectPageable] = useState(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );

  const handleAddProject = (): void => {
    console.log('handleAddProject');
    setProjectDialogOpen(true);
  };

  const handleProjectDialogClose = (): void => {
    console.log('handleProjectDialogClose');
    setProjectDialogOpen(false);
  };

  const handleProjectDialogSubmit = async (project: Project): Promise<void> => {
    console.log('handleProjectDialogSubmit', project);
    setProjectPageable(new Pageable(0, projectPageable.pageSize, projectPageable.sort));
    setValue('projectId', project.id);
  };

  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryPageable, setCategoryPageable] = useState(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );

  const handleAddCategory = (): void => {
    console.log('handleAddCategory');
    setCategoryDialogOpen(true);
  };

  const handleCategoryDialogClose = (): void => {
    console.log('handleProjectDialogClose');
    setCategoryDialogOpen(false);
  };

  const handleCategoryDialogSubmit = async (category: Category): Promise<void> => {
    console.log('handleCategoryDialogSubmit', category);
    setCategoryPageable(new Pageable(0, categoryPageable.pageSize, categoryPageable.sort));
    setValue('categoryId', category.id);
  };

  const [isLabelDialogOpen, setLabelDialogOpen] = useState(false);
  const [labelPageable, setLabelPageable] = useState(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );

  const handleAddLabel = (): void => {
    console.log('handleAddLabel');
    setLabelDialogOpen(true);
  };

  const handleLabelDialogClose = (): void => {
    console.log('handleProjectDialogClose');
    setLabelDialogOpen(false);
  };

  const handleLabelDialogSubmit = async (label: Label): Promise<void> => {
    console.log('handleLabelDialogSubmit', label);
    setLabelPageable(new Pageable(0, labelPageable.pageSize, labelPageable.sort));
    const labelIds = getValues('labelIds') || [];
    labelIds.push(label.id);
    setValue('labelIds', labelIds);
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)}>
        <Paper variant="outlined">
          <Grid container spacing={2} padding={2}>
            <Grid item xs={12}>
              <Controller
                name={`summary`}
                control={control}
                defaultValue={''}
                rules={{
                  required: '入力してください',
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }): React.ReactElement => (
                  <>
                    <TextField
                      onChange={onChange}
                      value={value}
                      label="タイトル"
                      error={!!error}
                      helperText={error?.message}
                      variant="outlined"
                      fullWidth
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="start.dateTime"
                control={control}
                rules={{
                  required: '入力してください',
                }}
                render={({ field: { onChange, value } }): React.ReactElement => (
                  <TimePicker
                    label="開始時間"
                    value={value}
                    onChange={onChange}
                    ampm={false}
                    format="HH:mm"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="end.dateTime"
                control={control}
                rules={{
                  required: '入力してください',
                  validate: (value): string | true => {
                    if (value && start.dateTime && value <= start.dateTime) {
                      return '終了時間は開始時間よりも後の時間にしてください';
                    }
                    return true;
                  },
                }}
                render={({ field: { onChange, value } }): React.ReactElement => (
                  <TimePicker
                    label="終了時間"
                    value={value}
                    onChange={onChange}
                    ampm={false}
                    format="HH:mm"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name={`projectId`}
                control={control}
                render={({ field: { onChange, value } }): JSX.Element => (
                  <ProjectPulldownComponent
                    pageable={projectPageable}
                    value={value}
                    onChange={onChange}
                    onAdd={handleAddProject}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name={`categoryId`}
                control={control}
                render={({ field: { onChange, value } }): JSX.Element => (
                  <CategoryPulldownComponent
                    pageable={categoryPageable}
                    value={value}
                    onChange={onChange}
                    onAdd={handleAddCategory}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name={`labelIds`}
                control={control}
                render={({ field }): JSX.Element => (
                  <LabelMultiSelectComponent
                    field={field}
                    pageable={labelPageable}
                    value={field.value}
                    onChange={field.onChange}
                    onAdd={handleAddLabel}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name={`description`}
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }): React.ReactElement => (
                  <>
                    <TextField
                      onChange={onChange}
                      value={value}
                      label="概要"
                      multiline
                      rows={5}
                      error={!!error}
                      helperText={error?.message}
                      variant="outlined"
                      fullWidth
                    />
                  </>
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      </form>
      {
        // formの中にformを入れると動作が不安定なので ProjectPulldownComponent の
        //「新しいプロジェクトを作成する」で開くダイアログは、ここに配置する
        isProjectDialogOpen && (
          <ProjectEdit
            isOpen={isProjectDialogOpen}
            projectId={null}
            onClose={handleProjectDialogClose}
            onSubmit={handleProjectDialogSubmit}
          />
        )
      }
      {
        // formの中にformを入れると動作が不安定なので CategoryPulldownComponent の
        //「新しいカテゴリーを作成する」で開くダイアログは、ここに配置する
        isCategoryDialogOpen && (
          <CategoryEdit
            isOpen={isCategoryDialogOpen}
            categoryId={null}
            onClose={handleCategoryDialogClose}
            onSubmit={handleCategoryDialogSubmit}
          />
        )
      }
      {
        // formの中にformを入れると動作が不安定なので LabelPulldownComponent の
        //「新しいカテゴリーを作成する」で開くダイアログは、ここに配置する
        isLabelDialogOpen && (
          <LabelEdit
            isOpen={isLabelDialogOpen}
            labelId={null}
            onClose={handleLabelDialogClose}
            onSubmit={handleLabelDialogSubmit}
          />
        )
      }
    </>
  );
};

export default React.forwardRef(EventEntryForm);
