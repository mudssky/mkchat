const TOPIC_ID_REGEX = /^c[\da-z]{24}$/i;

export function isValidTopicId(topicId: string): boolean {
  return TOPIC_ID_REGEX.test(topicId);
}
