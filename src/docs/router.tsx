import { createBrowserRouter } from 'react-router-dom'
import { DocsLayout } from '@/docs/layout/DocsLayout'
import { OverviewPage } from '@/docs/pages/OverviewPage'
import { PlaceholderPage } from '@/docs/pages/PlaceholderPage'
import { ColorsPage } from '@/docs/pages/ColorsPage'
import { TypographyPage } from '@/docs/pages/TypographyPage'
import { LayoutPage } from '@/docs/pages/LayoutPage'
import { BrandPage } from '@/docs/pages/BrandPage'

export const router = createBrowserRouter([
  {
    element: <DocsLayout />,
    children: [
      { path: '/', element: <OverviewPage /> },
      { path: '/foundations/colors', element: <ColorsPage /> },
      { path: '/foundations/typography', element: <TypographyPage /> },
      { path: '/foundations/layout', element: <LayoutPage /> },
      { path: '/foundations/motion', element: <PlaceholderPage title="Motion tokens" /> },
      { path: '/components/brand', element: <BrandPage /> },
      { path: '/components/buttons', element: <PlaceholderPage title="Buttons" /> },
      { path: '/components/chips', element: <PlaceholderPage title="Chips & Badges" /> },
      { path: '/components/cards', element: <PlaceholderPage title="Cards" /> },
      { path: '/components/lists', element: <PlaceholderPage title="Lists & Data" /> },
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
