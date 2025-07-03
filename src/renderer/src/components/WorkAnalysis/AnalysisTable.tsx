import { useState } from 'react';
import { visuallyHidden } from '@mui/utils';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { PageSortDirection } from '@shared/data/Page';
import { AnalysisTableColumns, AnalysisTableData } from '@shared/data/AnalysisTableData';

interface AnalysisTableProps {
  title: string;
  analysisTableData: AnalysisTableData;
}

export const AnalysisTable = (props: AnalysisTableProps): JSX.Element => {
  const { title, analysisTableData } = props;
  const [sortProperty, setSortProperty] = useState<string>(
    analysisTableData.headCells[0]?.key || ''
  );
  const [sortDirection, setSortDirection] = useState<PageSortDirection>('desc');

  const handleSort = (_event: React.MouseEvent<unknown>, key: string): void => {
    const isAsc = sortProperty === key && sortDirection === 'asc';
    setSortProperty(key);
    setSortDirection(isAsc ? 'desc' : 'asc');
  };

  const sortedRecords = [...analysisTableData.records].sort((a, b) => {
    return sortDirection === 'asc'
      ? a[sortProperty] > b[sortProperty]
        ? 1
        : -1
      : a[sortProperty] < b[sortProperty]
      ? 1
      : -1;
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          {title}
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="small">
            <AnalysisTableHead
              headCells={analysisTableData.headCells}
              sortProperty={sortProperty}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <AnalysisTableBody headCells={analysisTableData.headCells} records={sortedRecords} />
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

interface AnalysisTableHeadProps {
  headCells: readonly AnalysisTableColumns[];
  sortProperty: string;
  sortDirection: PageSortDirection;
  onSort: (event: React.MouseEvent<unknown>, key: string) => void;
}

const AnalysisTableHead = (props: AnalysisTableHeadProps): JSX.Element => {
  const { headCells, sortProperty, sortDirection, onSort } = props;
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(({ key, name }) => (
          <TableCell
            key={key}
            align="left"
            padding="normal"
            sortDirection={sortProperty === key ? sortDirection : false}
          >
            <TableSortLabel
              active={sortProperty === key}
              direction={sortProperty === key ? sortDirection : 'asc'}
              onClick={createSortHandler(key)}
            >
              {name}
              {sortProperty === key ? (
                <Box component="span" sx={visuallyHidden}>
                  {sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

interface AnalysisTableBodyProps {
  headCells: readonly AnalysisTableColumns[];
  records: Record<string, string | number>[];
}

const AnalysisTableBody = (props: AnalysisTableBodyProps): JSX.Element => {
  const { headCells, records } = props;

  return (
    <TableBody>
      {records.map((row, index) => (
        <TableRow key={index}>
          {headCells.map(({ key }) => {
            const rowValue: string | number = row[key];
            const isNegativeNum = typeof rowValue === 'number' && rowValue < 0;
            return (
              <TableCell
                key={key}
                id={key}
                scope="row"
                align="left"
                padding="normal"
                style={isNegativeNum ? { color: 'red' } : {}}
              >
                {rowValue}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  );
};
