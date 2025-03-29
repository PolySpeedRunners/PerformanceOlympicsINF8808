'use strict';

import { cleanNullValues, convertYearToInt, filterByYear, filterNonOlympics, groupByYear, computeScoresByYearSeason, convertNocToCountry, computeDisciplineScoresByCountry, findMissingCountries } from "./scripts/preprocess";


/**
 * @file This file is the entry-point for the the code for TP5 for the course INF8808.
 * @author Olivia Gélinas
 * @version v1.0.0
 */

(async function (d3) {
  const svgSize = {
    width: 800,
    height: 625
  }

  // helper.setCanvasSize(svgSize.width, svgSize.height)
  // helper.generateMapG(svgSize.width, svgSize.height)
  // helper.generateMarkerG(svgSize.width, svgSize.height)
  // helper.appendGraphLabels(d3.select('.main-svg'))
  // helper.initPanelDiv()

  await build();

  /**
   *   This function builds the graph.
   */
  async function build () {
    let resultsData = await d3.csv('./results.csv');
    resultsData = cleanNullValues(resultsData);
    resultsData = convertYearToInt(resultsData);
    resultsData = filterNonOlympics(resultsData);
    resultsData = filterByYear(resultsData, 1960);
    resultsData = groupByYear(resultsData);
    console.log(resultsData);
    let nocRegionsData = await d3.csv('./noc_regions.csv');
    const nocMap = new Map(nocRegionsData.map(d => [d.NOC, d.region]));
    console.log(nocMap);
    let gdpData = await d3.csv('./gdp.csv'); // NEEDS DATA ClEANING
    let populationData = await d3.csv('./populations.csv'); // NEEDS DATA CLEANING
    console.log(gdpData);
    console.log(populationData);

  const scoresByYearSeason = computeScoresByYearSeason(resultsData);
  console.log(scoresByYearSeason);
  const resultsWithCountryNames = convertNocToCountry(scoresByYearSeason, nocMap);
  console.log(resultsWithCountryNames);
  const test = computeDisciplineScoresByCountry(resultsData, nocMap); // TO KEEP, BETTER THAN resultsWithCountryNames
  console.log(test);
  findMissingCountries(gdpData, nocMap);


  }
})(d3)
