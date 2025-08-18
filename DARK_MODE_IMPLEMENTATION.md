# 🌙 Dark Mode Implementation

## 📅 Дата: 17 августа 2025

### ✅ Реализованные компоненты

#### 🎯 **Основная структура**
- **next-themes** - Библиотека для управления темами
- **ThemeProvider** - Провайдер для управления состоянием темы
- **ThemeToggle** - Компонент переключения темы

#### 🎨 **Цветовая схема**
- **Light Mode** - Светлая тема с серыми оттенками
- **Dark Mode** - Темная тема с контрастными цветами
- **System** - Автоматическое определение темы системы

### 🧩 **Компоненты**

#### **ThemeProvider** (`src/components/theme-provider.tsx`)
```typescript
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

#### **ThemeToggle** (`src/components/theme-toggle.tsx`)
```typescript
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 🎨 **CSS Переменные**

#### **Light Mode**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --radius: 0.5rem;
}
```

#### **Dark Mode**
```css
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}
```

### 📱 **Интеграция**

#### **Root Layout** (`src/app/layout.tsx`)
```typescript
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### **Страницы с переключателем темы**
- **Главная страница** (`/`) - Переключатель в правом верхнем углу
- **Страница входа** (`/auth/login`) - Переключатель в правом верхнем углу
- **Страница регистрации** (`/auth/register`) - Переключатель в правом верхнем углу
- **Dashboard** (`/dashboard`) - Переключатель в top bar рядом с уведомлениями

### 🎯 **Функциональность**

#### **Переключение тем**
- **Light** - Принудительно светлая тема
- **Dark** - Принудительно темная тема
- **System** - Автоматическое определение темы системы

#### **Анимации**
- **Плавные переходы** между темами
- **Анимированные иконки** (Sun/Moon)
- **Масштабирование** иконок при переключении

#### **Сохранение состояния**
- **Local Storage** - Сохранение выбранной темы
- **System Preference** - Автоматическое определение темы системы
- **Hydration Safe** - Безопасная гидратация без мерцания

### 🔧 **Технические особенности**

#### **Безопасность гидратации**
- `suppressHydrationWarning` в html теге
- Проверка `useTheme()` только на клиенте
- Плавные переходы без мерцания

#### **Производительность**
- CSS переменные для быстрого переключения
- Минимальные перерендеры
- Оптимизированные анимации

#### **Доступность**
- `sr-only` текст для скринридеров
- Keyboard navigation
- High contrast поддержка

### 🚀 **Использование**

#### **Добавление переключателя на новую страницу**
```typescript
import { ThemeToggle } from "@/components/theme-toggle";

export default function MyPage() {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0">
        <ThemeToggle />
      </div>
      {/* Содержимое страницы */}
    </div>
  );
}
```

#### **Программное переключение темы**
```typescript
import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}
```

### 🔗 **Полезные ссылки**

- **next-themes**: https://github.com/pacocoursey/next-themes
- **shadcn/ui Theme**: https://ui.shadcn.com/docs/dark-mode
- **Tailwind Dark Mode**: https://tailwindcss.com/docs/dark-mode

**Статус**: Темный режим полностью реализован и интегрирован! 🌙✨
