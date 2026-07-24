import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/app-shell';
import { MapCreatePage } from '../pages/maps/map-create.page';
import { MapEditorPage } from '../pages/maps/map-editor.page';
import { MapViewPage } from '../pages/maps/map-view.page';
import { MapsListPage } from '../pages/maps/maps-list.page';
import { NotFoundPage } from '../pages/not-found.page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/maps" replace /> },
      { path: 'maps', element: <MapsListPage /> },
      { path: 'maps/new', element: <MapCreatePage /> },
      { path: 'maps/:mapId/edit', element: <MapEditorPage /> },
      { path: 'maps/:mapId/view', element: <MapViewPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
