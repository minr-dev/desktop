import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { visuallyHidden } from '@mui/utils';
import { Page, PageSort, Pageable } from '@shared/data/Page';
import { Button } from '@mui/material';

export abstract class RowData {
  constructor(readonly item) {}

  abstract uniqueKey(): string;
}

export interface ColumnData {
  isKey: boolean;
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  callback?: (data: RowData) => React.ReactElement;
}

interface CrudTableHeadProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  page: Page<RowData> | null;
  headCells: readonly ColumnData[];
}

const CrudTableHead = ({
  page,
  numSelected,
  onSelectAllClick,
  onRequestSort,
  headCells,
}: CrudTableHeadProps): JSX.Element => {
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  let sortProperty;
  if (page && page.pageable.sort) {
    sortProperty = page.pageable.sort.property;
  }
  let sortDirection;
  if (page && page.pageable.sort) {
    sortDirection = page.pageable.sort.direction;
  }
  const rowCount = page ? page.content.length : 0;

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={sortProperty === headCell.id ? sortDirection : false}
          >
            <TableSortLabel
              active={sortProperty === headCell.id}
              direction={sortProperty === headCell.id ? sortDirection : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {sortProperty === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell padding="checkbox"></TableCell>
        <TableCell padding="checkbox"></TableCell>
      </TableRow>
    </TableHead>
  );
};

interface CrudTableToolbarProps {
  numSelected: number;
  title: string;
  onAdd: () => void;
  onDeleteSelected: () => void;
}

const CrudTableToolbar = ({
  numSelected,
  title,
  onAdd,
  onDeleteSelected,
}: CrudTableToolbarProps): JSX.Element => {
  const handleAdd = (): void => {
    console.log('handleAdd');
    onAdd();
  };
  const handleDeleteSelected = (): void => {
    console.log('handleDeleteSelected');
    onDeleteSelected();
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} 選択
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          {title}
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="削除">
          <IconButton onClick={(): void => handleDeleteSelected()} color="secondary">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <Button
            variant={'contained'}
            sx={{
              whiteSpace: 'nowrap',
            }}
            onClick={(): void => handleAdd()}
            color="primary"
          >
            <AddCircleIcon />
            追加
          </Button>
          {/* TODO: Filter機能は、カラムの特性が分かっていない状態で、
                    どう実装するか検討が必要なので、一旦コメントアウトしておく
          <Tooltip title="Filter list">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          */}
        </>
      )}
    </Toolbar>
  );
};

interface CrudTableProps {
  title: string;
  defaultPageable: Pageable;
  defaultDense: boolean;
  isDenseEnabled: boolean;
  page: Page<RowData> | null;
  headCells: readonly ColumnData[];
  onAdd: () => void;
  onEdit: (row: RowData) => void;
  onDelete: (row: RowData) => void;
  onBulkDelete: (uniqueKeys: string[]) => void;
  onChangePageable: (pageable: Pageable) => void;
}

export const CrudList = ({
  title,
  defaultPageable,
  defaultDense,
  isDenseEnabled,
  page,
  headCells,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onChangePageable,
}: CrudTableProps): JSX.Element => {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [pageable, setPageable] = React.useState<Pageable>(defaultPageable);
  const [dense, setDense] = React.useState(defaultDense);

  const handleRequestSort = (_event: React.MouseEvent<unknown>, newProperty: string): void => {
    const isAsc =
      pageable.sort && pageable.sort.property === newProperty && pageable.sort.direction === 'asc';
    const sort: PageSort = { property: newProperty, direction: isAsc ? 'desc' : 'asc' };
    const newPageable = pageable.replaceSort(sort);
    setPageable(newPageable);
    onChangePageable(newPageable);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (page === null) {
      return;
    }
    if (event.target.checked) {
      const newSelected = page.content.map((n) => n.uniqueKey());
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, uniqueKey: string): void => {
    const selectedIndex = selected.indexOf(uniqueKey);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, uniqueKey);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleAdd = (): void => {
    console.log('handleAdd', selected);
    onAdd();
  };

  const handleEdit = (event: React.MouseEvent<unknown>, row: RowData): void => {
    console.log('handleOpen', row);
    event.stopPropagation();
    onEdit(row);
  };

  const handleDelete = (event: React.MouseEvent<unknown>, row: RowData): void => {
    console.log('handleDelete', row);
    event.stopPropagation();
    onDelete(row);
  };

  const handleDeleteSelected = (): void => {
    console.log('handleDeleteSelected', selected);
    onBulkDelete(selected);
  };

  const handleChangePage = (_event: unknown, newPage: number): void => {
    const newPageable = pageable.replacePageNumber(newPage);
    setPageable(newPageable);
    onChangePageable(newPageable);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const rowsPerPage = parseInt(event.target.value, 10);
    const newPageable = pageable.replacePageSize(rowsPerPage);
    setPageable(newPageable);
    onChangePageable(newPageable);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDense(event.target.checked);
  };

  const isSelected = (name: string): boolean => selected.indexOf(name) !== -1;

  const rows = page ? page.content : [];

  // テーブルの最後のページにおいて、行（rows）がページごとの行数（rowsPerPage）に達しない場合の「空の行」の数を計算しています。
  // 目的は、テーブルの高さが急に変わることで起こるレイアウトの変更（いわゆる「レイアウトジャンプ」）を避けるためです。
  const emptyRows =
    pageable.pageNumber > 0
      ? Math.max(0, (1 + pageable.pageNumber) * pageable.pageSize - rows.length)
      : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <CrudTableToolbar
          title={title}
          numSelected={selected.length}
          onAdd={handleAdd}
          onDeleteSelected={handleDeleteSelected}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <CrudTableHead
              numSelected={selected.length}
              page={page}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              headCells={headCells}
            />
            <TableBody>
              {rows.map((row, index) => {
                const isItemSelected = isSelected(row.uniqueKey());
                const labelId = `crud-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event): void => handleClick(event, row.uniqueKey())}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.uniqueKey()}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        id={headCell.isKey ? row.uniqueKey() : undefined}
                        scope="row"
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        align={headCell.align}
                      >
                        {headCell.callback ? headCell.callback(row) : row.item[headCell.id]}
                      </TableCell>
                    ))}
                    <TableCell padding="checkbox">
                      <Tooltip title="編集">
                        <IconButton
                          onClick={(event): void => handleEdit(event, row)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell padding="checkbox">
                      <Tooltip title="削除">
                        <IconButton
                          onClick={(event): void => handleDelete(event, row)}
                          color="secondary"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={pageable.pageSize}
          page={pageable.pageNumber}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="1ページあたりの行数: "
          labelDisplayedRows={({ from, to, count }): string => `${from}-${to} 行目 / ${count}`}
        />
      </Paper>
      {isDenseEnabled && (
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
      )}
    </Box>
  );
};
