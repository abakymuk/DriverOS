# 🔐 Authentication Implementation

## 📅 Дата: 17 августа 2025

### ✅ Реализованные компоненты

#### 🎯 **Основная структура**
- **API Client** - Клиент для взаимодействия с backend API
- **Auth Hook** - Хук для управления состоянием аутентификации
- **Auth Guard** - Компонент для защиты роутов
- **Login/Register Pages** - Страницы входа и регистрации

#### 🔧 **Backend API**
- **JWT Authentication** - Токены доступа и обновления
- **User Management** - Создание и управление пользователями
- **Role-based Access** - Роли пользователей (driver, dispatcher, admin)

### 🧩 **Компоненты**

#### **API Client** (`src/lib/api.ts`)
```typescript
class ApiClient {
  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>>
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>>
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>>
  async logout(): Promise<ApiResponse<void>>
  async getProfile(token: string): Promise<ApiResponse<any>>
}
```

#### **Auth Hook** (`src/hooks/use-auth.ts`)
```typescript
export function useAuth() {
  // State management
  const [authState, setAuthState] = useState<AuthState>({...})
  
  // Functions
  const login = async (credentials: LoginRequest) => {...}
  const register = async (userData: RegisterRequest) => {...}
  const logout = async () => {...}
  const refreshToken = async () => {...}
  
  return { ...authState, login, register, logout, refreshToken }
}
```

#### **Auth Guard** (`src/components/auth-guard.tsx`)
```typescript
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading state and authentication check
}
```

### 📱 **Страницы аутентификации**

#### **Login Page** (`/auth/login`)
- **Email/Password** поля с валидацией
- **Password visibility** toggle
- **Loading states** во время запроса
- **Error handling** с toast уведомлениями
- **Theme toggle** в правом верхнем углу

#### **Register Page** (`/auth/register`)
- **Full name** поля (firstName, lastName)
- **Email** с валидацией
- **Role selection** (driver, dispatcher, admin)
- **Password/Confirm password** с валидацией
- **Terms agreement** checkbox
- **Loading states** и error handling

### 🎯 **Функциональность**

#### **Аутентификация**
- **JWT Tokens** - Access и Refresh токены
- **Local Storage** - Сохранение состояния аутентификации
- **Auto-login** - Восстановление сессии при перезагрузке
- **Token Refresh** - Автоматическое обновление токенов

#### **Защита роутов**
- **AuthGuard** - Защита dashboard страниц
- **Redirect** - Перенаправление неавторизованных пользователей
- **Loading states** - Индикаторы загрузки

#### **Управление пользователями**
- **User Profile** - Отображение информации пользователя
- **Logout** - Выход из системы
- **Role-based UI** - Интерфейс в зависимости от роли

### 🔧 **Технические особенности**

#### **Безопасность**
- **JWT Tokens** - Безопасная аутентификация
- **Password Hashing** - Хеширование паролей на backend
- **CORS** - Настройка для cross-origin запросов
- **Rate Limiting** - Ограничение частоты запросов

#### **UX/UI**
- **Loading States** - Индикаторы загрузки
- **Error Handling** - Обработка ошибок с toast
- **Form Validation** - Валидация форм
- **Responsive Design** - Адаптивный дизайн

#### **State Management**
- **Local Storage** - Персистентное хранение
- **React Hooks** - Управление состоянием
- **Auto-refresh** - Автоматическое обновление токенов

### 🚀 **Использование**

#### **Добавление защищенного роута**
```typescript
import { AuthGuard } from "@/components/auth-guard";

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>Protected content</div>
    </AuthGuard>
  );
}
```

#### **Использование аутентификации в компоненте**
```typescript
import { useAuth } from "@/hooks/use-auth";

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome, {user?.firstName}!</div>
      ) : (
        <button onClick={() => login({ email, password })}>Login</button>
      )}
    </div>
  );
}
```

### 🔗 **API Endpoints**

#### **Authentication**
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/profile` - Получение профиля

#### **Request/Response Formats**
```typescript
// Login Request
interface LoginRequest {
  email: string;
  password: string;
}

// Register Request
interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

// Auth Response
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
```

### 🔧 **Настройка**

#### **Environment Variables**
```env
# Backend
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### **Backend Dependencies**
- `@nestjs/jwt` - JWT модуль
- `@nestjs/passport` - Passport стратегии
- `bcryptjs` - Хеширование паролей
- `class-validator` - Валидация DTO

#### **Frontend Dependencies**
- `next-themes` - Управление темами
- `react-hot-toast` - Toast уведомления
- `localStorage` - Хранение состояния

### 🔗 **Полезные ссылки**

- **NestJS JWT**: https://docs.nestjs.com/security/authentication
- **Next.js Auth**: https://nextjs.org/docs/authentication
- **JWT.io**: https://jwt.io/
- **React Hot Toast**: https://react-hot-toast.com/

**Статус**: Аутентификация полностью реализована и интегрирована! 🔐✨
