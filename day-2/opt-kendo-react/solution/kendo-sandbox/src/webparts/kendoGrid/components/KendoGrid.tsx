import * as React from 'react';
import { Grid, GridColumn, type GridDataStateChangeEvent } from '@progress/kendo-react-grid';
import { process, type State } from '@progress/kendo-data-query';
import '@progress/kendo-theme-default/dist/all.css';
import styles from './KendoGrid.module.scss';
import type { IKendoGridProps, IPageItem } from './IKendoGridProps';

export default function KendoGrid(props: IKendoGridProps): JSX.Element {
  const { loadPages } = props;
  const [items, setItems] = React.useState<IPageItem[]>([]);
  const [error, setError] = React.useState<string>('');
  const [dataState, setDataState] = React.useState<State>({
    skip: 0,
    take: 10,
    sort: [{ field: 'Modified', dir: 'desc' }]
  });

  React.useEffect(() => {
    loadPages().then(setItems, (e: Error) => setError(e.message));
  }, [loadPages]);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <div className={styles.kendoGrid}>
      <Grid
        data={process(items, dataState)}
        {...dataState}
        onDataStateChange={(event: GridDataStateChangeEvent) => setDataState(event.dataState)}
        sortable={true}
        filterable={true}
        pageable={true}
      >
        <GridColumn field="Title" title="Title" />
        <GridColumn field="FileLeafRef" title="File" />
        <GridColumn field="Modified" title="Modified" filter="date" format="{0:d}" />
      </Grid>
    </div>
  );
}
