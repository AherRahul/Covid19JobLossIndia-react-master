import axios from 'axios';

import {promises as fs} from 'fs';

export function removeFileExtension(fileName) {
  return fileName.substr(0, fileName.lastIndexOf('.'));
}

function removeUnknown(e) {
  return e !== 'Unknown';
}

export async function getStatesAndDistrictsFromAPI() {
  const stateDistrictWiseResponse = (
    await axios.get('https://script.google.com/macros/s/AKfycbx1UDTpKisw7xhY7dXL1hbL_jXJsXRZmZTAgF7W3CE8GohNuuM/exec')
  ).data;
  const states = Object.keys(stateDistrictWiseResponse).filter(removeUnknown);
  const result = {};
  states.map((stateName) => {
    result[stateName] = Object.keys(
      stateDistrictWiseResponse[stateName]['districtData']
    ).filter(removeUnknown);
  });
  return result;
}

export async function getStatesAndDistrictsFromMaps() {
  const dir = await fs.opendir('public/maps');
  const districts = {};
  for await (const dirent of dir) {
    const fileName = dirent.name;
    const fileNameWithoutExtension = removeFileExtension(fileName);

    if (
      fileName === 'india.json' ||
      fileName === 'india_districts.json' ||
      fileName === 'dnh-and-dd.json'
    )
      continue;
    const data = JSON.parse(
      await fs.readFile(`public/maps/${fileName}`, 'binary')
    );

    const stateName =
      data.objects[`${fileNameWithoutExtension}_district`].geometries[0]
        .properties.st_nm;

    const result = data.objects[
      `${fileNameWithoutExtension}_district`
    ].geometries.map((e) => e.properties.district);

    districts[stateName] = result;
  }
  return districts;
}
