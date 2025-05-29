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

export interface AnalysisColumnData {
  key: string;
  label: string;
}

interface AnalysisTableProps {
  title: string;
  headCells: readonly AnalysisColumnData[];
  records: Record<string, string | number>[];
}

export const AnalysisTable = (props: AnalysisTableProps): JSX.Element => {
  const { title, headCells, records } = props;
  const [sortProperty, setSortProperty] = useState<string>(headCells[0].key || '');
  const [sortDirection, setSortDirection] = useState<PageSortDirection>('desc');

  const handleSort = (_event: React.MouseEvent<unknown>, key: string): void => {
    const isAsc = sortProperty === key && sortDirection === 'asc';
    setSortProperty(key);
    setSortDirection(isAsc ? 'desc' : 'asc');
  };

  const sortedRecords = [...records].sort((a, b) => {
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
              headCells={headCells}
              sortProperty={sortProperty}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <AnalysisTableBody headCells={headCells} records={sortedRecords} />
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

interface AnalysisTableHeadProps {
  headCells: readonly AnalysisColumnData[];
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
        {headCells.map(({ key, label }) => (
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
              {label}
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
  headCells: readonly AnalysisColumnData[];
  records: Record<string, string | number>[];
}

const AnalysisTableBody = (props: AnalysisTableBodyProps): JSX.Element => {
  const { headCells, records } = props;

  return (
    <TableBody>
      {records.map((row, index) => (
        <TableRow key={index}>
          {headCells.map(({ key }) => (
            <TableCell key={key} id={key} scope="row" align="left" padding="normal">
              {row[key]}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};
