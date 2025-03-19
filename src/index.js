'use strict';

import { cleanNullValues, convertYearToInt, filterByYear, filterNonOlympics, groupByYear } from "./scripts/preprocess";


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
    let gdpData = await d3.csv('./gdp.csv');
    let populationData = await d3.csv('./populations.csv');
    console.log(gdpData);
    console.log(populationData);
  }
})(d3)
