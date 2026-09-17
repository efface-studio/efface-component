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
import { MotionRevealPage } from '@/docs/pages/MotionRevealPage'
import { MotionScrollPage } from '@/docs/pages/MotionScrollPage'
import { MotionCursorPage } from '@/docs/pages/MotionCursorPage'
import { MotionTextPage } from '@/docs/pages/MotionTextPage'
import { NavigationPage } from '@/docs/pages/NavigationPage'
import { FooterPage } from '@/docs/pages/FooterPage'
import { OverlayPage } from '@/docs/pages/OverlayPage'

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
      { path: '/motion/reveal', element: <MotionRevealPage /> },
      { path: '/motion/scroll', element: <MotionScrollPage /> },
      { path: '/motion/cursor', element: <MotionCursorPage /> },
      { path: '/motion/text', element: <MotionTextPage /> },
      { path: '/layout/navigation', element: <NavigationPage /> },
      { path: '/layout/footer', element: <FooterPage /> },
      { path: '/layout/overlay', element: <OverlayPage /> },
      { path: '/banner', element: <PlaceholderPage title="efface Banner" /> },
      { path: '/recipes', element: <PlaceholderPage title="Sections" /> },
      { path: '*', element: <PlaceholderPage title="404" /> },
    ],
  },
])
