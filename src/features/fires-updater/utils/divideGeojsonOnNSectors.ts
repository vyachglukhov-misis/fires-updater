import * as turf from '@turf/turf';
import type { Feature, MultiPolygon } from 'geojson';

export const divideGeojsonOnNSectors = (
  geojson: Feature<MultiPolygon>,
  NSectors: number,
) => {
  // 1. BBOX региона
  const regionBbox = turf.bbox(geojson);
  const numCols = Math.ceil(Math.sqrt(NSectors));
  const numRows = Math.ceil(NSectors / numCols);
  const [minX, minY, maxX, maxY] = regionBbox;
  const deltaX = (maxX - minX) / numCols;
  const deltaY = (maxY - minY) / numRows;

  // 2. Сетка
  const resultCells = [];
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const cellMinX = minX + j * deltaX;
      const cellMinY = minY + i * deltaY;
      const cellMaxX = cellMinX + deltaX;
      const cellMaxY = cellMinY + deltaY;

      const cell = turf.bboxPolygon([cellMinX, cellMinY, cellMaxX, cellMaxY]);

      resultCells.push(cell);
    }
  }

  const gridFeatureCollection = turf.featureCollection(resultCells);
  return gridFeatureCollection;
};
