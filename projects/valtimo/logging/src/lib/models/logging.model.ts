interface LoggingEvent {
  timestamp: string;
  formattedMessage: string;
  level: string;
  properties: Array<LoggingEventProperty>;
  stacktrace: string;
}

interface LoggingEventProperty {
  key: string;
  value: string;
}

interface LoggingEventSearchRequest {
  afterTimestamp?: string;
  beforeTimestamp?: string;
  level?: string;
  likeFormattedMessage?: string;
  properties?: Array<LoggingEventProperty>;
  size?: number;
  page?: number;
}

const LOG_TOOLTIP_LIMIT = 128;

export {LoggingEvent, LoggingEventProperty, LoggingEventSearchRequest, LOG_TOOLTIP_LIMIT};
