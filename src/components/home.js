import Footer from './footer';
import Level from './level';
import MapExplorer from './mapexplorer';
import Minigraph from './minigraph';
import Search from './search';
import Table from './table';
import TimeSeriesExplorer from './timeseriesexplorer';
import Updates from './updates';
import GrowthTrendChart from './Charts/growthtrendchart';

import {STATE_CODES_REVERSE} from '../constants';
import {
  formatDate,
  formatDateAbsolute,
  mergeTimeseries,
  preprocessTimeseries,
  parseStateTimeseries,
  parseStateTestData,
  parseStateTestTimeseries,
  parseTotalTestTimeseries,
  parseDistrictZones,
} from '../utils/commonfunctions';

import axios from 'axios';
import React, {useState, useCallback, useMemo} from 'react';
import * as Icon from 'react-feather';
import {Helmet} from 'react-helmet';
import {useEffectOnce, useLocalStorage} from 'react-use';

function Home(props) {
  const [states, setStates] = useState(null);
  const [stateDistrictWiseData, setStateDistrictWiseData] = useState(null);
  const [districtZones, setDistrictZones] = useState(null);
  const [stateTestData, setStateTestData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [timeseries, setTimeseries] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [regionHighlighted, setRegionHighlighted] = useState({
    state: 'Total',
  });
  const [showUpdates, setShowUpdates] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [mapOption, setMapOption] = useState('confirmed');

  const [lastViewedLog, setLastViewedLog] = useLocalStorage(
    'lastViewedLog',
    null
  );
  const [newUpdate, setNewUpdate] = useLocalStorage('newUpdate', false);

  const Bell = useMemo(
    () => (
      <Icon.Bell
        onClick={() => {
          setShowUpdates(!showUpdates);
          setNewUpdate(false);
        }}
      />
    ),
    [setNewUpdate, showUpdates]
  );

  const BellOff = useMemo(
    () => (
      <Icon.BellOff
        onClick={() => {
          setShowUpdates(!showUpdates);
        }}
      />
    ),
    [showUpdates]
  );

  useEffectOnce(() => {
    getStates();
  });

  useEffectOnce(() => {
    axios
      .get('https://api.covid19india.org/updatelog/log.json')
      .then((response) => {
        const lastTimestamp = response.data
          .slice()
          .reverse()[0]
          .timestamp.toString();
        if (lastTimestamp !== lastViewedLog) {
          setNewUpdate(true);
          setLastViewedLog(lastTimestamp);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });

  const getStates = async () => {
    try {
      const [
        {data: statesDailyResponse},
        {data: zonesResponse},
      ] = await Promise.all([
        axios.get('https://api.covid19india.org/states_daily.json'),
        axios.get('https://api.covid19india.org/zones.json'),
      ]);

      const [
        {data},
        {data: stateDistrictWiseResponse},
        {data: stateTestData},
      ] = await Promise.all([
        axios.get('https://script.google.com/macros/s/AKfycbzbnAAnnvSgHmuNm5TQdm8Dk4hH5cMlmIsR4Mkhqekk90r2r_w/exec'),
        axios.get('https://script.google.com/macros/s/AKfycbx1UDTpKisw7xhY7dXL1hbL_jXJsXRZmZTAgF7W3CE8GohNuuM/exec'),
        axios.get('https://api.covid19india.org/state_test_data.json'),
      ]);

      
      setStates(data.statewise);
      setDistrictZones(parseDistrictZones(zonesResponse.zones));

      const ts = parseStateTimeseries(statesDailyResponse);
      ts['TT'] = preprocessTimeseries(data.cases_time_series);
      // Testing data timeseries
      const testTs = parseStateTestTimeseries(stateTestData.states_tested_data);
      testTs['TT'] = parseTotalTestTimeseries(data.tested);
      // Merge
      const tsMerged = mergeTimeseries(ts, testTs);
      setTimeseries(tsMerged);

      setLastUpdated(data.statewise[0].lastupdatedtime);

      console.log(data);

      const testData = parseStateTestData(stateTestData.states_tested_data);
      const totalTest = data.tested[data.tested.length - 1];
      testData['Total'] = {
        source: totalTest.source,
        totaltested: totalTest.totalsamplestested,
        updatedon: totalTest.updatetimestamp.split(' ')[0],
      };
      
      setStateTestData(testData);
      
      setStateDistrictWiseData(stateDistrictWiseResponse);
      setFetched(true);
    } catch (err) {
      console.log(err);
    }
  };

  

  const onHighlightState = useCallback((state) => {
    if (!state) return setRegionHighlighted(null);
    setRegionHighlighted({state: state.state});
  }, []);

  const onHighlightDistrict = useCallback((district, state) => {
    if (!state && !district) return setRegionHighlighted(null);
    setRegionHighlighted({district, state: state.state});
  }, []);

  return (
    <React.Fragment>
      <div className="Home">
      <div className="home-left">   
       <React.Fragment>
          {fetched && (
              <MapExplorer
                mapName={'India'}
                states={states}
                districts={stateDistrictWiseData}
                zones={districtZones}
                stateTestData={stateTestData}
                regionHighlighted={regionHighlighted}
                setRegionHighlighted={setRegionHighlighted}
                anchor={anchor}
                setAnchor={setAnchor}
                mapOption={mapOption}
                setMapOption={setMapOption}
              />
            )}
          </React.Fragment>
        </div>
        

        <div className="home-right">
        {stateDistrictWiseData && (
            <Table
              states={states}
              summary={false}
              districts={stateDistrictWiseData}
              zones={districtZones}
              regionHighlighted={regionHighlighted}
              setRegionHighlighted={setRegionHighlighted}
              onHighlightState={onHighlightState}
              onHighlightDistrict={onHighlightDistrict}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;