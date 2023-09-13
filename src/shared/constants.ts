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

  CATEGORY_LIST = 'category_list',
  CATEGORY_GET = 'category_get',
  CATEGORY_SAVE = 'category_save',
  CATEGORY_DELETE = 'category_delete',
  CATEGORY_BULK_DELETE = 'category_bulk_delete',

  CALENDAR_GET = 'calendar_get',
  CALENDAR_SYNC = 'calendar_sync',

  GITHUB_ACTIVITY_SYNC = 'github_activity_sync',

  SPEAK_TEXT_NOTIFY = 'speak_text_notify',
  ACTIVITY_NOTIFY = 'activity_notify',
  EVENT_ENTRY_NOTIFY = 'event_entry_notify',
}

export const LOCAL_USER_ID = 'LOCAL_USER_ID';
