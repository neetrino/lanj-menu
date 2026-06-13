# Lanj Menu — план UI (Figma → код)

> Figma: [lanj — глобальный макет](https://www.figma.com/design/TxU93NPNtrJtwP2D5QHnR0/lanj?node-id=1-5)
> Подход: mobile-first, слой за слоем, контейнеры + переиспользуемые компоненты.

## Текущее состояние codebase

| Область | Статус |
|--------|--------|
| Stack | Next.js 15, React 19, Tailwind 3, Prisma, pnpm |
| Структура | `src/features/menu/*`, `src/lib/menu/*` |
| Данные | `MenuSnapshot` → `MenuPayload` (sections → categories → items) |
| i18n | `hy`, `ru`, `en` через `/[locale]` |
| Стили | Базовый orange header; карточки list-row — **не совпадают с Figma** |

## Дизайн-токены (из Figma)

| Token | Value | Использование |
|-------|-------|---------------|
| `brand.bg` | `#faaa77` | pill-табы, globe-кнопка |
| `brand.accent` | `#c4673a` | badge на карточке |
| `brand.price` | `#e8a987` | цена на карточке |
| `brand.border` | `#ffa97f` | outline категории |
| `surface.page` | `#ffffff` | фон страницы |
| `surface.cream` | `#fff8f3` | текст/кнопки на тёмном |
| `surface.card` | `#e8d5c4` | fallback карточки |
| `text.primary` | `#1a0c06` | заголовки, активный таб |
| `text.muted` | `#8b6555` | greeting |
| `text.on-dark-muted` | `rgba(255,248,243,0.65)` | описание на карточке |

**Шрифты:** DM Sans (UI), Playfair Display (названия блюд; замена Cherlav Demo в heading).

## Компонентная карта

```
MenuPage
├── MenuPageContainer          — max-width, padding, desktop grid
├── MenuHeader
│   ├── MenuHeroHeader         — greeting + title + LanguageSwitcher (globe)
│   ├── SectionTabs            — Pool Menu / Restaurant (верхние табы)
│   └── CategoryTabs           — Bar Menu / Kitchen + иконки (нижние табы)
├── MenuCategoryList
│   └── MenuItemCard           — hero-карточка продукта
└── EmptyState
```

## Этапы работы

### Фаза 0 — Подготовка ✅
- [x] Изучить codebase и Figma (nodes 1:5, 1:9, 1:22, 1:21, 1:36)
- [x] Составить план в `todo.md`

### Фаза 1 — Foundation
- [x] Design tokens в `tailwind.config.ts`
- [x] Шрифты через `next/font` (DM Sans, Playfair Display)
- [x] `globals.css` — белый фон страницы
- [x] UI-переводы: greeting, heading

### Фаза 2 — Header block (node 1:9)
- [x] `MenuHeroHeader` — greeting, title, globe language switcher
- [x] `LanguageSwitcher` — круглая orange кнопка + popover языков

### Фаза 3 — Верхние табы (node 1:22)
- [x] `SectionTabs` — pill switcher, active white / inactive on orange

### Фаза 4 — Нижние табы (node 1:21 + категории)
- [x] `CategoryTabs` — active black pill + icon, inactive outline
- [x] SVG-иконки: globe, cocktail, food, arrow-up-right

### Фаза 5 — Карточка продукта (node 1:36 + MenuCard)
- [x] `MenuItemCard` — image, gradient, badge, arrow, name, price
- [ ] Описание блюда — **ждёт поле в БД** (сейчас скрыто)

### Фаза 6 — Сборка страницы (node 1:5)
- [x] `MenuPage` — фильтр по active category
- [x] `MenuPageContainer` — mobile 430px, desktop адаптив
- [x] Удалить legacy orange sticky header

### Фаза 7 — Полировка
- [ ] Визуальная проверка 1:1 с Figma (mobile 393px)
- [ ] Desktop: 2-col grid карточек на `lg+`
- [ ] Accessibility: focus, aria, reduced motion
- [ ] Storybook / скриншот-тесты (опционально)

### Фаза 8 — Backlog (после UI)
- [ ] Поле `description` в Prisma + snapshot
- [ ] Детальная страница продукта (arrow button)
- [ ] Валюта из env (сейчас `֏` в `formatPrice`)
- [ ] Cherlav Demo font asset (если дизайнер даст файл)

## Figma-ссылки по компонентам

| Компонент | Node | URL |
|-----------|------|-----|
| Глобальный макет | 1:5 | `node-id=1-5` |
| Header | 1:9 | `node-id=1-9` |
| Верхние табы | 1:22 | `node-id=1-22` |
| Контейнер верхних табов | 1:21 | `node-id=1-21` |
| Gradient overlay карточки | 1:36 | `node-id=1-36` |

## Definition of Done (UI slice)

1. Mobile 393px — визуально совпадает с Figma (отступы, радиусы, цвета).
2. Компоненты изолированы, без inline styles, токены в Tailwind.
3. Работает с реальными данными из `MenuSnapshot`.
4. i18n для статического UI-текста.
5. `pnpm typecheck` и `pnpm lint` без ошибок.
