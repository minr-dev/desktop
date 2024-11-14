import { CategoryFixture } from '@shared/data/__tests__/CategoryFixture';
import { EventEntryCsvSettingFixture } from '@shared/data/__tests__/EventEntryCsvSettingFixture';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { LabelFixture } from '@shared/data/__tests__/LabelFixture';
import { ProjectFixture } from '@shared/data/__tests__/ProjectFixture';
import { TaskFixture } from '@shared/data/__tests__/TaskFixture';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventEntryCsvFixture } from '../../dto/__tests__/EventEntryCsvFixture';
import { EventEntryCsv } from '../../dto/EventEntryCsv';
import { EventEntryCsvSearchServiceImpl } from '../EventEntryCsvSearchServiceImpl';
import { ICategoryService } from '../ICategoryService';
import { ICsvCreateService } from '../ICsvCreateService';
import { IEventEntryCsvSearchService } from '../IEventEntryCsvSearchService';
import { IEventEntryService } from '../IEventEntryService';
import { ILabelService } from '../ILabelService';
import { IProjectService } from '../IProjectService';
import { ITaskService } from '../ITaskService';
import { IUserDetailsService } from '../IUserDetailsService';
import { CategoryServiceMockBuilder } from './__mocks__/CategoryServiceMockBuilder';
import { CsvCreateServiceMockBuilder } from './__mocks__/CsvCreateServiceMockBuilder';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { LabelServiceMockBuilder } from './__mocks__/LabelServiceMockBuilder';
import { ProjectServiceMockBuilder } from './__mocks__/ProjectServiceMockBuilder';
import { TaskServiceMockBuilder } from './__mocks__/TaskServiceMockBuilder';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';

const eventEntryCsvHeader = {
  eventEntryId: '予実ID',
  eventType: '予実種類',
  start: '開始日時',
  end: '終了日時',
  summary: 'タイトル',
  projectId: 'プロジェクトID',
  projectName: 'プロジェクト名',
  categoryId: 'カテゴリーID',
  categoryName: 'カテゴリー名',
  taskId: 'タスクID',
  taskName: 'タスク名',
  labelIds: 'ラベルID',
  labelNames: 'ラベル名',
  description: '概要',
};

describe('EventEntryCsvSearchServiceImpl', () => {
  let userDetailsService: IUserDetailsService;
  let eventEntryService: IEventEntryService;
  let service: IEventEntryCsvSearchService;
  let projectService: IProjectService;
  let categoryService: ICategoryService;
  let taskService: ITaskService;
  let labelService: ILabelService;
  let csvCreateService: ICsvCreateService<EventEntryCsv>;
  const userId = 'user1';

  beforeEach(() => {
    userDetailsService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    projectService = new ProjectServiceMockBuilder().build();
    categoryService = new CategoryServiceMockBuilder().build();
    taskService = new TaskServiceMockBuilder().build();
    labelService = new LabelServiceMockBuilder().build();
    csvCreateService = new CsvCreateServiceMockBuilder().build();
    service = new EventEntryCsvSearchServiceImpl(
      userDetailsService,
      eventEntryService,
      projectService,
      categoryService,
      taskService,
      labelService,
      csvCreateService
    );
  });

  describe('searchEventEntryCsv', () => {
    describe('引数がEventEntryサービスメソッドに渡され、その結果が各サービスメソッドに渡されている。', () => {
      const testCase = [
        {
          description: 'EventEntryCsvSettingのeventTypeが設定されていない場合',
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [
            EventEntryFixture.default({
              projectId: '1',
              categoryId: '2',
              taskId: '3',
              labelIds: ['4'],
            }),
          ],
          resultLabel: [
            LabelFixture.default({
              id: '4',
              name: 'test-label',
            }),
          ],
          expected: {
            paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
            resultEventEntry: [
              EventEntryFixture.default({
                projectId: '1',
                categoryId: '2',
                taskId: '3',
                labelIds: ['4'],
              }),
            ],
            resultLabels: [
              LabelFixture.default({
                id: '4',
                name: 'test-label',
              }),
            ],
          },
        },
        {
          description: 'EventEntryCsvSettingのeventTypeが設定されている場合',
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default({
            eventType: EVENT_TYPE.PLAN,
          }),
          resultEventEntry: [
            EventEntryFixture.default({
              projectId: '1',
              categoryId: '2',
              taskId: '3',
              labelIds: ['4'],
            }),
          ],
          resultLabel: [
            LabelFixture.default({
              id: '4',
              name: 'test-label',
            }),
          ],
          expected: {
            paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default({
              eventType: EVENT_TYPE.PLAN,
            }),
            resultEventEntry: [
              EventEntryFixture.default({
                projectId: '1',
                categoryId: '2',
                taskId: '3',
                labelIds: ['4'],
              }),
            ],
            resultLabels: [
              LabelFixture.default({
                id: '4',
                name: 'test-label',
              }),
            ],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        // convertArrayToString は Label サービスで出力された結果を使用しているので、labelService の返り値を設定する。
        jest.spyOn(labelService, 'getAll').mockResolvedValue(t.resultLabel);

        await service.searchEventEntryCsv(t.paramSearchEventEntryCsv);

        expect(eventEntryService.list).toHaveBeenCalledWith(
          userId,
          t.expected.paramSearchEventEntryCsv.start,
          t.expected.paramSearchEventEntryCsv.end,
          t.expected.paramSearchEventEntryCsv.eventType
        );
        expect(projectService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.projectId)
        );
        expect(categoryService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.categoryId)
        );
        expect(taskService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.taskId)
        );
        expect(labelService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.labelIds).flat()
        );
        // labelService で出力されたデータが、convertArrayToString に渡されているかをテストする。
        expect(csvCreateService.convertArrayToString).toHaveBeenCalledWith(
          t.expected.resultEventEntry[0].labelIds
        );
        expect(csvCreateService.convertArrayToString).toHaveBeenCalledWith(
          t.expected.resultLabels.map((label) => label.name)
        );
      });
    });
    describe('EventEntryCsvSearchServiceImplのヘッダーは外部から参照できない値のため、テスト用のヘッダーと出力した値の1つ目(ヘッダー)を比較し一致していることを証明する。', () => {
      const testCase = [
        {
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [],
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);

        const eventEntryCsvs = await service.searchEventEntryCsv(t.paramSearchEventEntryCsv);

        expect(eventEntryCsvs[0]).toEqual(eventEntryCsvHeader);
      });
    });
    describe('メソッド内で検索されたEventEntryにヘッダーを加えたレコード数が、出力したEventEntryCsvのレコード数と一致している。', () => {
      const testCase = [
        {
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [EventEntryFixture.default()],
          expected: {
            recordCount: 2,
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);

        const eventEntryCsvs = await service.searchEventEntryCsv(t.paramSearchEventEntryCsv);

        expect(eventEntryCsvs).toHaveLength(t.expected.recordCount);
      });
    });
    describe('メソッド内で検索されたEventEntryのeventTypeが、予実種類(予定,実績,共有)に変換されて出力される。', () => {
      const testCase = [
        {
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [EventEntryFixture.default({ eventType: EVENT_TYPE.PLAN })],
          expected: {
            eventTypeName: '予定',
          },
        },
        {
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [EventEntryFixture.default({ eventType: EVENT_TYPE.ACTUAL })],
          expected: {
            eventTypeName: '実績',
          },
        },
        {
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [EventEntryFixture.default({ eventType: EVENT_TYPE.SHARED })],
          expected: {
            eventTypeName: '共有',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);

        const eventEntryCsvs = await service.searchEventEntryCsv(t.paramSearchEventEntryCsv);

        expect(eventEntryCsvs[1].eventType).toEqual(t.expected.eventTypeName);
      });
    });
    describe('出力したEventEntryCsvの日時が、yyyy/MM/dd HH:mm 形式で出力される。', () => {
      const testCase = [
        {
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({
                dateTime: new Date('2024-11-12T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2024-11-13T14:00:00+0900') }),
            }),
          ],
          expected: {
            resultEventEntryCsv: [
              eventEntryCsvHeader,
              EventEntryCsvFixture.default({
                start: '2024/11/12 13:00',
                end: '2024/11/13 14:00',
              }),
            ],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);

        const eventEntryCsvs = await service.searchEventEntryCsv(t.paramSearchEventEntryCsv);

        for (let i = 0; i < eventEntryCsvs.length; i++) {
          expect(eventEntryCsvs[i].start).toEqual(t.expected.resultEventEntryCsv[i].start);
          expect(eventEntryCsvs[i].end).toEqual(t.expected.resultEventEntryCsv[i].end);
        }
      });
    });
    describe('メソッド内で検索されたEventEntryのid,summary,descriptionと、出力したEventEntryCsvのeventEntryId,summary,descriptionが一致している。', () => {
      const testCase = [
        {
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [
            EventEntryFixture.default({
              id: '1',
              summary: 'test1',
              description: 'bummy',
            }),
          ],
          expected: {
            resultEventEntryCsv: [
              eventEntryCsvHeader,
              EventEntryCsvFixture.default({
                eventEntryId: '1',
                summary: 'test1',
                description: 'bummy',
              }),
            ],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);

        const eventEntryCsvs = await service.searchEventEntryCsv(t.paramSearchEventEntryCsv);

        for (let i = 0; i < eventEntryCsvs.length; i++) {
          expect(eventEntryCsvs[i].eventEntryId).toEqual(
            t.expected.resultEventEntryCsv[i].eventEntryId
          );
          expect(eventEntryCsvs[i].summary).toEqual(t.expected.resultEventEntryCsv[i].summary);
          expect(eventEntryCsvs[i].description).toEqual(
            t.expected.resultEventEntryCsv[i].description
          );
        }
      });
    });
    describe('メソッド内で出力されたEventEntryに紐づいたプロジェクト,カテゴリ,タスク,ラベルと、出力したEventEntryCsvのプロジェクト,カテゴリ,タスク,ラベルのIdとNameが一致している。', () => {
      const testCase = [
        {
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [
            EventEntryFixture.default({
              projectId: '1',
              categoryId: '2',
              taskId: '3',
            }),
          ],
          resultProject: [
            ProjectFixture.default({
              id: '1',
              name: 'test-project',
            }),
          ],
          resultCategory: [
            CategoryFixture.default({
              id: '2',
              name: 'test-category',
            }),
          ],
          resultTask: [
            TaskFixture.default({
              id: '3',
              name: 'test-task',
            }),
          ],
          resultLabel: [LabelFixture.default({})],
          resultConvertArrayToString: 'bummy',
          expected: {
            resultProject: [
              ProjectFixture.default({
                id: '1',
                name: 'test-project',
              }),
            ],
            resultCategory: [
              CategoryFixture.default({
                id: '2',
                name: 'test-category',
              }),
            ],
            resultTask: [
              TaskFixture.default({
                id: '3',
                name: 'test-task',
              }),
            ],
            resultConvertArrayToString: 'bummy',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(projectService, 'getAll').mockResolvedValue(t.resultProject);
        jest.spyOn(categoryService, 'getAll').mockResolvedValue(t.resultCategory);
        jest.spyOn(taskService, 'getAll').mockResolvedValue(t.resultTask);
        jest.spyOn(labelService, 'getAll').mockResolvedValue(t.resultLabel);
        jest
          .spyOn(csvCreateService, 'convertArrayToString')
          .mockReturnValue(t.resultConvertArrayToString);

        const eventEntryCsvs = await service.searchEventEntryCsv(t.paramSearchEventEntryCsv);

        expect(eventEntryCsvs[1].projectId).toEqual(t.expected.resultProject[0].id);
        expect(eventEntryCsvs[1].projectName).toEqual(t.expected.resultProject[0].name);
        expect(eventEntryCsvs[1].categoryId).toEqual(t.expected.resultCategory[0].id);
        expect(eventEntryCsvs[1].categoryName).toEqual(t.expected.resultCategory[0].name);
        expect(eventEntryCsvs[1].taskId).toEqual(t.expected.resultTask[0].id);
        expect(eventEntryCsvs[1].taskName).toEqual(t.expected.resultTask[0].name);
        // labelはconvertArrayToStringで変換した値を出力しているため、convertArrayToStringの値が出力されているかを検証する。
        expect(eventEntryCsvs[1].labelIds).toEqual(t.expected.resultConvertArrayToString);
        expect(eventEntryCsvs[1].labelNames).toEqual(t.expected.resultConvertArrayToString);
      });
    });
    describe('メソッド内で出力されたEventEntryにプロジェクト,カテゴリ,タスク,ラベルのIdが付いていても、紐づくデータが無い場合はIdとNameがブランクとして出力される。', () => {
      const testCase = [
        {
          paramSearchEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntry: [
            EventEntryFixture.default({
              projectId: '1',
              categoryId: '2',
              taskId: '3',
              labelIds: ['4'],
            }),
          ],
          resultProject: [
            ProjectFixture.default({
              id: '5',
              name: 'test-project',
            }),
          ],
          resultCategory: [
            CategoryFixture.default({
              id: '5',
              name: 'test-category',
            }),
          ],
          resultTask: [
            TaskFixture.default({
              id: '5',
              name: 'test-task',
            }),
          ],
          resultLabel: [
            LabelFixture.default({
              id: '5',
              name: 'test-label',
            }),
          ],
          resultConvertArrayToString: 'bummy',
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(projectService, 'getAll').mockResolvedValue(t.resultProject);
        jest.spyOn(categoryService, 'getAll').mockResolvedValue(t.resultCategory);
        jest.spyOn(taskService, 'getAll').mockResolvedValue(t.resultTask);
        jest.spyOn(labelService, 'getAll').mockResolvedValue(t.resultLabel);
        jest
          .spyOn(csvCreateService, 'convertArrayToString')
          .mockReturnValue(t.resultConvertArrayToString);

        const eventEntryCsvs = await service.searchEventEntryCsv(t.paramSearchEventEntryCsv);

        expect(eventEntryCsvs[1].projectId).toEqual('');
        expect(eventEntryCsvs[1].projectName).toEqual('');
        expect(eventEntryCsvs[1].categoryId).toEqual('');
        expect(eventEntryCsvs[1].categoryName).toEqual('');
        expect(eventEntryCsvs[1].taskId).toEqual('');
        expect(eventEntryCsvs[1].taskName).toEqual('');
        // labelがブランクであれば空配列が渡されるためconvertArrayToStringの引数が空配列か検証する。
        expect(csvCreateService.convertArrayToString).toHaveBeenCalledWith([]);
      });
    });
  });
});
