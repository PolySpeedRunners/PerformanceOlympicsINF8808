/**
 * Cleans the dataset by removing entries with falsy values for "discipline", "type", or "year".
 *
 * @param {object[]} data The dataset with missing values
 * @returns {object[]} The cleaned dataset
 */
export function cleanNullValues(data) {
    return data.filter(item => item.discipline && item.type && item.year);
  }


/**
 * Converts the "year" field to an integer in the dataset.
 *
 * @param {object[]} data The dataset with year as a string or float
 * @returns {object[]} The dataset with "year" as an integer
 */
export function convertYearToInt(data) {
    return data.map(item => ({
      ...item,
      year: item.year ? parseInt(item.year, 10) : item.year
    }));
  }

/**
 * Filters out entries where the "event" does not contain "(Olympic)".
 *
 * @param {object[]} data The dataset to filter
 * @returns {object[]} The filtered dataset
 */
export function filterNonOlympics(data) {
    return data.filter(item => item.event.includes("(Olympic)"));
  }


/**
 * Filters out entries with the year below the specified year".
 *
 * @param {object[]} data The dataset to filter
 * @param {object[]} year The year to filter
 * @returns {object[]} The filtered dataset
 */
export function filterByYear(data,year) {
    return data.filter(item => item.year >= year);
  }

/**
 * Groups the dataset by the "year" field.
 *
 * @param {object[]} data The dataset to group
 * @returns {object} An object where keys are years and values are arrays of corresponding entries
 */
export function groupByYear(data) {
    return data.reduce((acc, item) => {
      const year = item.year;
      const type = item.type;
      const key = year+","+type;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }

