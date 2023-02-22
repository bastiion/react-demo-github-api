import * as React from 'react';
// @ts-ignore
import {DataGridPro, GridColDef, GridRenderCellParams, GridRowModel, useGridApiContext} from '@mui/x-data-grid-pro';
// @ts-ignore
import {useDemoData} from '@mui/x-data-grid-generator';
import {Box, Container, Input, Rating} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import criteria from './criteria.yml'
import {CriteriaWithIdAndScores, flattenDictionary} from "@/components/flattenDictionary";
import { SHA256, enc } from 'crypto-js';
import {usePollStorage} from "@/components/helper/usePollStorage";
import {flatten} from "lodash";
import dayjs from "dayjs";

const ENTITY_URI = 'http://lod.data.slub-dresden.de/entity#'

const makeURI: (id: string) => string = id => `${ENTITY_URI}${id}`
//console.log({criteria: flattenDictionary(criteria)})

function renderRating(params: GridRenderCellParams<number>) {
  return <Rating readOnly value={params.value}/>;
}

function RatingEditInputCell(props: GridRenderCellParams<number>) {
  const {id, value, field} = props;
  const apiRef = useGridApiContext();

  const handleChange = (event: React.SyntheticEvent, newValue: number | null) => {
    apiRef.current.setEditCellValue({id, field, value: newValue});
  };

  const handleRef = (element: HTMLSpanElement) => {
    if (element) {
      const input = element.querySelector<HTMLInputElement>(
          `input[value="${value}"]`,
      );
      input?.focus();
    }
  };

  return (
      <Box sx={{display: 'flex', alignItems: 'center', pr: 2}}>
        <Rating
            ref={handleRef}
            name="rating"
            precision={1}
            value={value ?? null}
            onChange={handleChange}
        />
      </Box>
  );
}

const renderRatingEditInputCell: GridColDef['renderCell'] = (params) => {
  return <RatingEditInputCell {...params} />;
};

function WeightEditInputCell(props: GridRenderCellParams<number>) {
  const {id, value, field} = props;
  const apiRef = useGridApiContext();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    apiRef.current.setEditCellValue({id, field, value: ev.target?.value});
  };

  const handleRef = (element: HTMLSpanElement) => {
    if (element) {
      const input = element.querySelector<HTMLInputElement>(
          `input[value="${value}"]`,
      );
      input?.focus();
    }
  };

  return (
      <Box sx={{display: 'flex', alignItems: 'center', pr: 2}}>
        <Input
            ref={handleRef}
            name="rating"
            type={'number'}
            inputProps={{
              step: 1,
              min: 0,
              max: 100
            }}
            value={value}
            onChange={handleChange}
        />
      </Box>
  );
}

const renderWeightEditInputCell: GridColDef['renderCell'] = (params) => {
  return <WeightEditInputCell {...params} />;
};

const defaultRatingFieldDefs: Partial<GridColDef> = {
  type: 'number',
  renderCell: renderRating,
  renderEditCell: renderRatingEditInputCell,
  editable: true
}
const columnsDM: GridColDef[] = [
  {
    field: 'id',
    hide: true
  },
  {
    field: 'name',
    headerName: 'Kriterium',
    groupable: false,
    width: 120
  },
  {
    field: 'weight',
    headerName: 'Gewichtung',
    type: 'number',
    width: 150,
    editable: true,
    renderEditCell: renderWeightEditInputCell
  },
  {
    field: 'typo3_value01',
    headerName: 'qualitative Bewertung',
    ...defaultRatingFieldDefs
  },
  {
    field: 'typo3_value02',
    headerName: 'Langfristiger Mehrwert',
    ...defaultRatingFieldDefs
  },
  {
    field: 'typo3_value03',
    headerName: 'zeitlicher Aufwand',
    ...defaultRatingFieldDefs
  },
  {
    field: 'typo3_value04',
    headerName: 'Spezialisierungsgrad',
    ...defaultRatingFieldDefs
  },
  {
    field: 'next_value01',
    headerName: 'qualitative Bewertung',
    ...defaultRatingFieldDefs
  },
  {
    field: 'next_value02',
    headerName: 'Langfristiger Mehrwert',
    ...defaultRatingFieldDefs
  },
  {
    field: 'next_value03',
    headerName: 'zeitlicher Aufwand',
    ...defaultRatingFieldDefs
  },
  {
    field: 'next_value04',
    headerName: 'Spezialisierungsgrad',
    ...defaultRatingFieldDefs
  }
]

const columnGroupingModel = [
  {
    groupId: 'typo3',
    headerName: 'Typo 3 - basierend',
    children: [
      {field: 'typo3_value01'},
      {field: 'typo3_value02'},
      {field: 'typo3_value03'},
      {field: 'typo3_value04'}
    ]
  },
  {
    groupId: 'next',
    headerName: '"neuer Ansatz"',
    children: [
      {field: 'next_value01'},
      {field: 'next_value02'},
      {field: 'next_value03'},
      {field: 'next_value04'}
    ]
  }

]

const criteriaData = flattenDictionary(criteria)
    .map((c, index) => ({...c, id: (c as any).id ||  makeURI(SHA256(c.path.join()+c.name).toString(enc.Hex))}))


console.log({criteriaData})

const rowsToScores = (rows: CriteriaWithIdAndScores[]) => flatten(rows.map(({id, name, path, ...scores}) =>
    Object.entries(scores).map(([key, value]) => ({
      criteria: id,
      key,
      score: value as number
    }))))

export default function TreeDataGrid() {

  const [rows, setRows] = useState<CriteriaWithIdAndScores[]>(criteriaData)

  const {pollData, setPollData, initialized} = usePollStorage()
  const [remoteFetched, setRemoteFetched] = useState(false);

  useEffect(() => {
    if(remoteFetched) return
    fetch('https://raw.githubusercontent.com/bastiion/decision-adb-test/main/adb-next-vs-typo3-decision-matrix.json')
        .then(res => res.json())
        .then(storedPoll => {
          setRemoteFetched(true)
          setPollData(storedPoll)
        })
  }, [setPollData, remoteFetched, setRemoteFetched]);
  useEffect(() => {
    console.log({pollData})
    if(!pollData) return
    let dataRows = criteriaData
    pollData?.scores?.forEach(score => {
      const rowId = dataRows.findIndex(data => data.id === score.criteria)
      dataRows = Object.assign([], dataRows, {[rowId]: {...dataRows[rowId], [score.key]: score.score }})
    })
    // @ts-ignore
    setRows(dataRows)
  }, [pollData, setRows]);

  useEffect(() => {
    console.log({rows})
  }, [rows]);



  const handleChange = useCallback(
      async (newRow: GridRowModel) => {
        // @ts-ignore
        /*setRows(oldRows => {
          let rowIndex = (oldRows || []).findIndex(({id}) => newRow.id === id) || -1
          if(rowIndex >= 0) {
            // @ts-ignore
            return Object.assign([], oldRows, {[rowIndex]: newRow})
          } else {
            return [...oldRows, newRow]
          }
        })*/
        let rowIndex = (rows || []).findIndex(({id}) => newRow.id === id) || -1
        let newRows = (rowIndex >= 0) ? Object.assign([], rows, {[rowIndex]: newRow}) : [...rows, newRow]
        setPollData({
          updated: dayjs().format(),
          scores: rowsToScores(newRows)
        })
        return newRow
      },
      [ rows, setPollData]
  );


  return (<Container>
        <div style={{height: 1000, width: '100%'}}>
          {/*<DataGridPro loading={loading} {...data} /> */}
          <DataGridPro
              experimentalFeatures={{
                columnGrouping: true,
                newEditingApi: true
              }}
              defaultGroupingExpansionDepth={3}
              columns={columnsDM}
              columnGroupingModel={columnGroupingModel}
              editMode={'row'}
              rows={initialized ? rows : []}
              processRowUpdate={handleChange}
              getTreeDataPath={({path}) => path || []}
              treeData={true}
              /*treeData={{maxDepth: 2, groupingField: 'path', averageChildren: 200}}*/
          />
        </div>
      </Container>
  );
}
