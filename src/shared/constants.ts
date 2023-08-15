export enum IpcChannel {
  USER_DETAILS_GET = 'user_details_get',

  GOOGLE_AUTHENTICATE = 'google_authenticate',
  GOOGLE_GET_ACCESS_TOKEN = 'google_get_access_token',
  GOOGLE_REVOKE = 'google_revoke',

  USER_PREFERENCE_CREATE = 'user_preference_create',
  USER_PREFERENCE_GET = 'user_preference_get',
  USER_PREFERENCE_SAVE = 'user_preference_save',

  EVENT_ENTRY_LIST = 'event_entry_list',
  EVENT_ENTRY_GET = 'event_entry_get',
  EVENT_ENTRY_CREATE = 'event_entry_create',
  EVENT_ENTRY_SAVE = 'event_entry_save',
  EVENT_ENTRY_DELETE = 'event_entry_delete',

  ACTIVITY_EVENT_LIST = 'actity_event_list',

  GOOGLE_CALENDAR_GET = 'google_calendar_get',
}

export const LOCAL_USER_ID = 'LOCAL_USER_ID';
