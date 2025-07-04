export enum IpcChannel {
  USER_DETAILS_GET = 'user_details_get',

  GOOGLE_AUTHENTICATE = 'google_authenticate',
  GOOGLE_GET_ACCESS_TOKEN = 'google_get_access_token',
  GOOGLE_REVOKE = 'google_revoke',

  GITHUB_AUTHENTICATE = 'github_authenticate',
  GITHUB_SHOW_USER_CODE_INPUT_WINDOW = 'github_show_user_code_input_window',
  GITHUB_ABORT_POLLING = 'github_abort_polling',
  GITHUB_GET_ACCESS_TOKEN = 'github_get_access_token',
  GITHUB_REVOKE = 'github_revoke',

  USER_PREFERENCE_CREATE = 'user_preference_create',
  USER_PREFERENCE_GET = 'user_preference_get',
  USER_PREFERENCE_SAVE = 'user_preference_save',

  EVENT_ENTRY_LIST = 'event_entry_list',
  EVENT_ENTRY_GET = 'event_entry_get',
  EVENT_ENTRY_CREATE = 'event_entry_create',
  EVENT_ENTRY_COPY = 'event_entry_copy',
  EVENT_ENTRY_SAVE = 'event_entry_save',
  EVENT_ENTRY_DELETE = 'event_entry_delete',

  ACTIVITY_EVENT_LIST = 'actity_event_list',
  GITHUB_EVENT_LIST = 'github_event_list',
  ACTIVITY_USAGE_LIST = 'activity_usage_list',

  AUTO_REGISTER_PROVISIONAL_ACTUALS = 'auto_register_provisional_actual',
  CONFIRM_ACTUAL_REGISTRATION = 'confirm_actual_registration',
  DELETE_PROVISONAL_ACTUALS = 'delete_provisional_actuals',

  AUTO_REGISTER_PROVISIONAL_PLANS = 'auto_register_provisional_plans',
  CONFIRM_PLAN_REGISTRATION = 'confirm_plan_registration',
  DELETE_PROVISONAL_PLANS = 'delete_provisional_plans',

  CATEGORY_LIST = 'category_list',
  CATEGORY_GET = 'category_get',
  CATEGORY_SAVE = 'category_save',
  CATEGORY_DELETE = 'category_delete',
  CATEGORY_BULK_DELETE = 'category_bulk_delete',

  LABEL_LIST = 'label_list',
  LABEL_GET = 'label_get',
  LABEL_SAVE = 'label_save',
  LABEL_DELETE = 'label_delete',
  LABEL_BULK_DELETE = 'label_bulk_delete',

  PROJECT_LIST = 'project_list',
  PROJECT_GET = 'project_get',
  PROJECT_SAVE = 'project_save',
  PROJECT_DELETE = 'project_delete',
  PROJECT_BULK_DELETE = 'project_bulk_delete',

  TASK_LIST = 'task_list',
  TASK_GET = 'task_get',
  TASK_SAVE = 'task_save',
  TASK_DELETE = 'task_delete',
  TASK_BULK_DELETE = 'task_bulk_delete',

  PATTERN_LIST = 'pattern_list',
  PATTERN_GET = 'pattern_get',
  PATTERN_SAVE = 'pattern_save',
  PATTERN_DELETE = 'pattern_delete',
  PATTERN_BULK_DELETE = 'pattern_bulk_delete',

  SET_AUTO_LAUNCH_ENABLED = 'set_auto_launch_enabled',

  PLAN_PATTERN_LIST = 'plan_pattern_list',
  PLAN_PATTERN_GET = 'plan_pattern_get',
  PLAN_PATTERN_SAVE = 'plan_pattern_save',
  PLAN_PATTERN_DELETE = 'plan_pattern_delete',
  PLAN_PATTERN_BULK_DELETE = 'plan_pattern_bulk_delete',

  PLAN_TEMPLATE_LIST = 'plan_template_list',
  PLAN_TEMPLATE_GET = 'plan_template_get',
  PLAN_TEMPLATE_SAVE = 'plan_template_save',
  PLAN_TEMPLATE_DELETE = 'plan_template_delete',
  PLAN_TEMPLATE_BULK_DELETE = 'plan_template_bulk_delete',

  PLAN_TEMPLATE_EVENT_LIST = 'plan_template_event_list',
  PLAN_TEMPLATE_EVENT_GET = 'plan_template_event_get',
  PLAN_TEMPLATE_EVENT_BULK_UPSERT = 'plan_template_event_bulk_upsert',
  PLAN_TEMPLATE_EVENT_BULK_DELETE = 'plan_template_event_bulk_delete',
  PLAN_TEMPLATE_EVENT_CREATE = 'plan_template_event_create',
  PLAN_TEMPLATE_EVENT_COPY = 'plan_template_event_copy',

  CALENDAR_GET = 'calendar_get',
  CALENDAR_SYNC = 'calendar_sync',

  GITHUB_ACTIVITY_SYNC = 'github_activity_sync',

  POMODORO_TIMER_GET_CURRENT_DETAILS = 'pomodoro_timer_get_current_details',
  POMODORO_TIMER_START = 'pomodoro_timer_start',
  POMODORO_TIMER_PAUSE = 'pomodoro_timer_pause',
  POMODORO_TIMER_STOP = 'pomodoro_timer_stop',
  POMODORO_TIMER_CURRENT_DETAILS_NOTIFY = 'pomodoro_timer_current_details_notify',

  APPLY_PLAN_TEMPLATE = 'apply_plan_template',

  SPEAK_TEXT_NOTIFY = 'speak_text_notify',
  SEND_DESKTOP_NOTIFY = 'send_desktop_notify',
  ACTIVITY_NOTIFY = 'activity_notify',
  EVENT_ENTRY_NOTIFY = 'event_entry_notify',
  GITHUB_USER_CODE_NOTIFY = 'github_user_code_notify',

  PLAN_AND_ACTUAL_CSV_CREATE = 'plan_and_actual_csv_create',
  EVENT_AGGREGATION_PROJECT = 'event_aggregation_project',
  EVENT_AGGREGATION_CATEGORY = 'event_aggregation_category',
  EVENT_AGGREGATION_TASK = 'event_aggregation_task',
  EVENT_AGGREGATION_LABEL = 'event_aggregation_label',

  GITHUB_PROJECT_V2_LIST = 'github_project_v2_list',

  GITHUB_PROJECT_V2_SYNC_GITHUB_PROJECT_V2 = 'github_project_v2_sync_project',
  GITHUB_PROJECT_V2_SYNC_ORGANIZATION = 'github_project_v2_sync_organization',
  GITHUB_PROJECT_V2_SYNC_ITEM = 'github_project_v2_sync_item',

  GITHUB_TASK_SYNC = 'github_task_sync',

  LOGGER_INFO = 'logger_info',
  LOGGER_WARN = 'logger_warn',
  LOGGER_ERROR = 'logger_error',
  LOGGER_DEBUG = 'logger_debug',
  LOGGER_ISDEBUGENABLED = 'logger_isdebugenabled',
}

export const LOCAL_USER_ID = 'LOCAL_USER_ID';
