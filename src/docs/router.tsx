import { createBrowserRouter } from 'react-router-dom'
import { DocsLayout } from '@/docs/layout/DocsLayout'
import { OverviewPage } from '@/docs/pages/OverviewPage'
import { PlaceholderPage } from '@/docs/pages/PlaceholderPage'
import { ColorsPage } from '@/docs/pages/ColorsPage'
import { TypographyPage } from '@/docs/pages/TypographyPage'
import { LayoutPage } from '@/docs/pages/LayoutPage'
import { BrandPage } from '@/docs/pages/BrandPage'
import { MotionTokensPage } from '@/docs/pages/MotionTokensPage'
import { ButtonsPage } from '@/docs/pages/ButtonsPage'
import { ChipsPage } from '@/docs/pages/ChipsPage'
import { CardsPage } from '@/docs/pages/CardsPage'
import { ListsPage } from '@/docs/pages/ListsPage'

export const router = createBrowserRouter([
  {
    element: <DocsLayout />,
    children: [
      { path: '/', element: <OverviewPage /> },
      { path: '/foundations/colors', element: <ColorsPage /> },
      { path: '/foundations/typography', element: <TypographyPage /> },
      { path: '/foundations/layout', element: <LayoutPage /> },
      { path: '/foundations/motion', element: <MotionTokensPage /> },
      { path: '/components/brand', element: <BrandPage /> },
      { path: '/components/buttons', element: <ButtonsPage /> },
      { path: '/components/chips', element: <ChipsPage /> },
      { path: '/components/cards', element: <CardsPage /> },
      { path: '/components/lists', element: <ListsPage /> },
      { path: '/motion/reveal', element: <PlaceholderPage title="Reveal" /> },
      { path: '/motion/scroll', element: <PlaceholderPage title="Scroll" /> },
      { path: '/motion/cursor', element: <PlaceholderPage title="Cursor" /> },
      { path: '/motion/text', element: <PlaceholderPage title="Text" /> },
      { path: '/layout/navigation', element: <PlaceholderPage title="Navigation" /> },
      { path: '/layout/footer', element: <PlaceholderPage title="Footer" /> },
      { path: '/layout/overlay', element: <PlaceholderPage title="Overlay" /> },
      { path: '/banner', element: <PlaceholderPage title="efface Banner" /> },
      { path: '/recipes', element: <PlaceholderPage title="Sections" /> },
      { path: '*', element: <PlaceholderPage title="404" /> },
    ],
  },
])
