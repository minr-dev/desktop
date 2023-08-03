export enum IpcChannel {
  GOOGLE_AUTHENTICATE = 'google_authenticate',
  GOOGLE_GET_ACCESS_TOKEN = 'google_get_access_token',
  GOOGLE_REVOKE = 'google_revoke',

  GOOGLE_CREDENTIALS_GET = 'google_credentials_get',
  GOOGLE_CREDENTIALS_SAVE = 'google_credentials_save',

  USER_PREFERENCE_CREATE = 'user_preference_create',
  USER_PREFERENCE_GET = 'user_preference_get',
  USER_PREFERENCE_SAVE = 'user_preference_save',

  SCHEDULE_EVENT_LIST = 'schedule_event_list',
  SCHEDULE_EVENT_GET = 'schedule_event_get',
  SCHEDULE_EVENT_CREATE = 'schedule_event_create',
  SCHEDULE_EVENT_SAVE = 'schedule_event_save',
  SCHEDULE_EVENT_DELETE = 'schedule_event_delete',

  ACTIVITY_EVENT_LIST = 'actity_event_list',

  GOOGLE_CALENDAR_GET = 'google_calendar_get',
  GOOGLE_CALENDAR_LIST = 'google_calendar_list',
}
