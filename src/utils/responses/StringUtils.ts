/**
 * This class is meant to have auxiliary/helper methods to deal with objects of
 * type String
 */
export default class StringUtils {
  /**
   * Compares 2 strings in a case insensitive manner
   * @param first string to be compared
   * @param second string to be compared
   */
  public static equalsIgnoreCase(first: string = '', second: string = ''): boolean {
    return first.toUpperCase() === second.toUpperCase();
  }

  /**
   * Checks if a string is empty
   * @param value
   */
  public static isEmpty(value: string = ''): boolean {
    return value.length === 0;
  }
}
