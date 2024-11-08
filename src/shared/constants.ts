export enum IpcChannel {
  USER_DETAILS_GET = 'user_details_get',

  GOOGLE_AUTHENTICATE = 'google_authenticate',
  GOOGLE_GET_ACCESS_TOKEN = 'google_get_access_token',
  GOOGLE_REVOKE = 'google_revoke',

  GITHUB_AUTHENTICATE = 'github_authenticate',
  GITHUB_GET_ACCESS_TOKEN = 'github_get_access_token',
  GITHUB_REVOKE = 'github_revoke',

  USER_PREFERENCE_CREATE = 'user_preference_create',
  USER_PREFERENCE_GET = 'user_preference_get',
  USER_PREFERENCE_SAVE = 'user_preference_save',

  EVENT_ENTRY_LIST = 'event_entry_list',
  EVENT_ENTRY_GET = 'event_entry_get',
  EVENT_ENTRY_CREATE = 'event_entry_create',
  EVENT_ENTRY_SAVE = 'event_entry_save',
  EVENT_ENTRY_DELETE = 'event_entry_delete',

  ACTIVITY_EVENT_LIST = 'actity_event_list',
  GITHUB_EVENT_LIST = 'github_event_list',
  ACTIVITY_USAGE_LIST = 'activity_usage_list',

  AUTO_REGISTER_PROVISIONAL_ACTUALS = 'auto_register_provisional_actual',
  CONFIRM_ACTUAL_REGISTRATION = 'confirm_actual_registration',
  DELETE_PROVISONAL_ACTUALS = 'delete_provisional_actuals',

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

  CALENDAR_GET = 'calendar_get',
  CALENDAR_SYNC = 'calendar_sync',

  GITHUB_ACTIVITY_SYNC = 'github_activity_sync',

  POMODORO_TIMER_GET_CURRENT_DETAILS = 'pomodoro_timer_get_current_details',
  POMODORO_TIMER_START = 'pomodoro_timer_start',
  POMODORO_TIMER_PAUSE = 'pomodoro_timer_pause',
  POMODORO_TIMER_STOP = 'pomodoro_timer_stop',
  POMODORO_TIMER_CURRENT_DETAILS_NOTIFY = 'pomodoro_timer_current_details_notify',

  SPEAK_TEXT_NOTIFY = 'speak_text_notify',
  SEND_DESKTOP_NOTIFY = 'send_desktop_notify',
  ACTIVITY_NOTIFY = 'activity_notify',
  EVENT_ENTRY_NOTIFY = 'event_entry_notify',

  LOGGER_INFO = 'logger_info',
  LOGGER_WARN = 'logger_warn',
  LOGGER_ERROR = 'logger_error',
  LOGGER_DEBUG = 'logger_debug',
  LOGGER_ISDEBUGENABLED = 'logger_isdebugenabled',
}

export const LOCAL_USER_ID = 'LOCAL_USER_ID';
