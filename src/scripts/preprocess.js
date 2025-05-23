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


export function getMedalValue(medal) {
  return medal === "Gold" ? 3 :
          medal === "Silver" ? 2 :
          medal === "Bronze" ? 1 : 0;
}

export function computeScoresByYearSeason(resultsData) {
  return Object.fromEntries(
      Object.entries(resultsData).map(([key, athletes]) => {
          // Reset added combinations for each year-season key
          const addedCombinations = new Set();

          const nocScores = d3.rollup(
              athletes,
              (group) => {
                  return d3.sum(group, (d) => {
                      const combination = `${d.discipline}-${d.event}-${d.noc}-${d.medal}`;

                      // Prevents team work to be counted multiple times
                      if (!addedCombinations.has(combination) && getMedalValue(d.medal) > 0) {
                          addedCombinations.add(combination);
                          return getMedalValue(d.medal);
                      }
                      return 0; 
                  });
              },
              (d) => d.noc
          );
          return [key, Object.fromEntries(nocScores)];
      })
  );
}
// https://en.wikipedia.org/wiki/List_of_IOC_country_codes
// ROC is RUSSIA
// NEEDS TO CHECK THE DIFFERENCE IN COUNTRY CODE LIKE SINGAPORE, LEBANON
export function convertNocToCountry(results, nocMap) {
  return Object.fromEntries(
      Object.entries(results).map(([yearSeason, nocScores]) => {
          const countryScores = [];
          for (const [noc, score] of Object.entries(nocScores)) {
              const country = nocMap.get(noc) || 'Unknown'; // Fallback to 'Unknown' if NOC isn't found
              countryScores.push({
                  countryName: country,
                  medals: score
              });
          }
          return [yearSeason, countryScores];
      })
  );
}


export function computeDisciplineScoresByCountry(resultsData, nocMap) {
  return Object.fromEntries(
      Object.entries(resultsData).map(([key, athletes]) => {
          const addedCombinations = new Set();

          const disciplineScores = d3.rollup(
              athletes,
              (group) => {
                  const countryName = nocMap.get(group[0].noc) || 'Unknown';

                  const result = { countryName, totalMedals: 0 };

                  for (const d of group) {
                      const combination = `${d.discipline}-${d.event}-${d.noc}-${d.medal}`;
                      const medalValue = getMedalValue(d.medal);

                      if (!addedCombinations.has(combination) && medalValue > 0) {
                          addedCombinations.add(combination);

                          result[d.discipline] = (result[d.discipline] || 0) + medalValue;
                          result.totalMedals += medalValue;
                      }
                  }

                  return result;
              },
              (d) => d.noc
          );

          return [key, Object.fromEntries(disciplineScores)];
      })
  );
}

export function findAndFixMissingCountries(gdpData, nocMap, countryMap) {
  let counter = 0;
  // May need to fix noc region csv such as West Germany, East Germany, Russia, etc
  gdpData.forEach(entry => {
      const countryCode = entry["Country Code"];
      const countryName = entry["Country Name"];

      if (!nocMap.has(countryCode)) {
          if (countryMap.has(countryName)) {
              // Reassign country code based on countryMap
              const newCode = countryMap.get(countryName);
              entry["Country Code"] = newCode;
              // console.log(`Reassigned: ${countryName} -> ${newCode}`);
          } else {
              console.log(`Missing: ${countryCode} - ${countryName}`);
              counter++;
          }
      }
  });

  console.log(`Total missing after reassignment: ${counter}`);
}


export function addDataToMedalData(medalData, data, dataKey, mapKey) {
  const dataMap = new Map(data.map(entry => [entry[mapKey], entry]));

  Object.entries(medalData).forEach(([yearSeason, countries]) => {
    const year = yearSeason.split(",")[0];
    
    Object.entries(countries).forEach(([NOC, countryData]) => {
      const dataEntry = dataMap.get(NOC) || dataMap.get(countryData.countryName);
      countryData[dataKey] = dataEntry && dataEntry[year] ? parseFloat(dataEntry[year]) || null : null;
    });
  });

  return medalData;
}

export function addPopulationToMedalData(medalData, populationData) {
  return addDataToMedalData(medalData, populationData, "population", "Country Code");
}

export function addGDPToMedalData(medalData, gdpData) {
  return addDataToMedalData(medalData, gdpData, "gdp", "Country Code");
}


