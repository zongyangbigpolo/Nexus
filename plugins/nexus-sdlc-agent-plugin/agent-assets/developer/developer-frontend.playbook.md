# Frontend (MFE development) Stack Playbook

Comprehensive patterns for React 18+ MFE (microfrontend) applications with modern tooling

---

## Naming Conventions

| Element        | Convention              | Example                        |
| -------------- | ----------------------- | ------------------------------ |
| Components     | PascalCase              | `UserProfile`, `NavigationBar` |
| Hooks (React)  | use prefix              | `useAuth`, `useUserData`       |
| Files (React)  | PascalCase + extension  | `UserProfile.js`, `hooks.js`   |
| CSS classes    | kebab-case or BEM       | `user-profile`, `btn--primary` |
| Event handlers | handle prefix           | `handleClick`, `handleSubmit`  |
| Constants      | SCREAMING_SNAKE_CASE    | `API_ENDPOINTS`, `ERROR_CODES` |
| Redux slices   | camelCase               | `userSlice`, `authSlice`       |
| Routes         | kebab-case              | `/user-profile`, `/dashboard`  |
| Test files     | Component + .test/.spec | `UserProfile.test.js`          |
| Page Objects   | PascalCase + Page       | `LoginPage`, `DashboardPage`   |

---

## Project Structure (React 18+) MFE

```
app/
+-- babel.config.json           # Babel settings
+-- jest.config.js              # Jest settings
+-- webpack.config.js           # Local development server
+-- webpack.bundle.js           # Building/bundling MFE app
+-- src/
    +-- features/               # Feature-based organization
    |   +-- common/             # Shared components (Button, Modal, layouts)
    |   +-- auth/               # Authentication feature
    |   |   +-- components/     # Feature components
    |   |   +-- hooks/          # Feature-specific hooks
    |   |   +-- services/       # API calls for this feature
    |   |   `-- index.js        # Public API
    |   `-- dashboard/          # Dashboard feature
    +-- data/                   # Redux Toolkit store
    |   +-- slices/             # Redux slices
    |   `-- api/                # RTK Query APIs    
    +-- hooks/                  # Global custom hooks
    +-- services/               # API services and utilities
    +-- utils/                  # Pure utility functions
    +-- lang/                   # Internationalization files
    +-- assets/                 # Static assets (images, fonts)    
    +-- Router.js               # React Router configuration
    +-- App.js                  # Main React app component
    +-- store.js                # Main Redux configuration
    `-- ztna-ui-[name]-mfe.js   # MFE entry point

test/                    # Cypress E2E tests
+-- cypress/
|   +-- e2e/             # Test specs
|   +-- fixtures/        # Test data
|   +-- support/         # Commands and utilities
|   `-- pageobjects/     # Page Object Models
`-- cypress.config.js
```

---

## React 18+ Patterns

### Functional Component
```jsx
export function UserProfile({ userId, onEdit }) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return null;

  return (
    <div className="user-profile">
      <Avatar src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      {onEdit && <Button onClick={onEdit}>Edit</Button>}
    </div>
  );
}
```

### Custom Hook
```jsx
function useUser(userId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        setIsLoading(true);
        const user = await userService.getById(userId);
        if (!cancelled) {
          setData(user);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();
    return () => { cancelled = true; };
  }, [userId]);

  return { data, isLoading, error };
}
```

### Form Handling
```jsx
function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validate({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <Button type="submit">Login</Button>
    </form>
  );
}
```

### React Router v6 Patterns
```jsx
// Route Configuration
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
        loader: dashboardLoader,
      },
      {
        path: 'users/:userId',
        element: <UserProfile />,
        loader: ({ params }) => userLoader(params.userId),
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}

// Component with navigation
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const handleEdit = () => {
    navigate(`/users/${userId}/edit`);
  };
  
  return (
    <div>
      <h1>User {userId}</h1>
      <Button onClick={handleEdit}>Edit User</Button>
    </div>
  );
}
```

### Redux Toolkit Patterns
```jsx
// Store setup
import { configureStore } from '@reduxjs/toolkit';
import { userApi } from './api/userApi';
import userSlice from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),
});

// Slice definition
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    preferences: {},
    isLoading: false,
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

// RTK Query API
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
  }),
});

// Component using Redux
import { useSelector, useDispatch } from 'react-redux';
import { useGetUserQuery } from '../store/api/userApi';
import { setProfile } from '../store/slices/userSlice';

function UserProfile({ userId }) {
  const dispatch = useDispatch();
  const { data: user, isLoading } = useGetUserQuery(userId);
  const preferences = useSelector((state) => state.user.preferences);
  
  useEffect(() => {
    if (user) {
      dispatch(setProfile(user));
    }
  }, [user, dispatch]);
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <pre>{JSON.stringify(preferences, null, 2)}</pre>
    </div>
  );
}
```

### React 18 Features
```jsx
// Suspense with lazy loading
import { Suspense, lazy } from 'react';

const LazyDashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyDashboard />
    </Suspense>
  );
}

// Error Boundary
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Concurrent features with startTransition
import { startTransition, useDeferredValue } from 'react';

function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const deferredQuery = useDeferredValue(query);
  
  const handleSearch = (newQuery) => {
    startTransition(() => {
      // Mark this update as low priority
      performExpensiveSearch(newQuery).then(setResults);
    });
  };
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      <ResultList results={results} query={deferredQuery} />
    </div>
  );
}
```

---

## Webpack Configuration

### Development Configuration

In the project tree above we refer to a single `webpack.config.js` (with `webpack.bundle.js` as a built output bundle). The examples below use a split-config setup (`webpack.dev.js` / `webpack.prod.js`) for clarity. In your project you can either:

- Keep a single `webpack.config.js` and fold the dev/prod differences into it, or
- Use multiple config files (e.g. `webpack.dev.js`, `webpack.prod.js`) and point your npm scripts at the appropriate one.

In all cases, `webpack.bundle.js` is the generated bundle file, not a config file you create manually.

```javascript
// Example development config (often named webpack.dev.js or used via webpack.config.js in dev mode)
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devServer: {
    port: 8080,
    hot: true,
    historyApiFallback: true,
    // Restrict allowed hosts to local development; add more hosts explicitly if needed.
    allowedHosts: ['localhost'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ModuleFederationPlugin({
      name: 'myApp',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};
```

### Production Configuration
```javascript
// webpack.prod.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ],
};
```

---

## Jest Unit Testing Best Practices

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/**/*.stories.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
    'single-spa-react/parcel': 'single-spa-react/lib/cjs/parcel.cjs',
    '^@citrix-lib/rdx/(.*)$': '@citrix/rdx/lib/$1',
    '^@citrix-lib/ztna-ui-utility-module/api/(.*)$': '@citrix/ztna-ui-utility-module/api/$1/$1.js',
    '^@citrix-lib/(.*)$': '@citrix/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(some-es6-module)/)',
  ],
};

// src/test/setup.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Mock console.error to fail tests on React warnings
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
    throw new Error(`React warning: ${args[0]}`);
  }
  originalError(...args);
};

// MSW server setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Component Testing Patterns
```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { UserProfile } from './UserProfile';
import { createTestStore } from '../test/utils';

// Test wrapper for providers
function TestWrapper({ children, initialState = {} }) {
  const store = createTestStore(initialState);
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
}

// Helper function
function renderWithProviders(ui, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper initialState={options.initialState}>
        {children}
      </TestWrapper>
    ),
    ...options,
  });
}

describe('UserProfile', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user name when loaded', async () => {
    // Arrange
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    const initialState = {
      user: { profile: mockUser, isLoading: false },
    };

    // Act
    renderWithProviders(<UserProfile userId="1" />, { initialState });

    // Assert
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Arrange
    const initialState = {
      user: { profile: null, isLoading: true },
    };

    // Act
    renderWithProviders(<UserProfile userId="1" />, { initialState });

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', async () => {
    // Arrange
    const handleEdit = jest.fn();
    const mockUser = { id: '1', name: 'John Doe' };
    const initialState = {
      user: { profile: mockUser, isLoading: false },
    };

    renderWithProviders(
      <UserProfile userId="1" onEdit={handleEdit} />,
      { initialState }
    );

    // Act
    await user.click(screen.getByRole('button', { name: /edit/i }));

    // Assert
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith(mockUser);
  });

  it('handles error state gracefully', () => {
    // Arrange
    const initialState = {
      user: {
        profile: null,
        isLoading: false,
        error: 'Failed to load user',
      },
    };

    // Act
    renderWithProviders(<UserProfile userId="1" />, { initialState });

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/failed to load user/i)).toBeInTheDocument();
  });
});
```

### Hook Testing
```jsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    // Arrange
    const { result } = renderHook(() => useCounter(0));

    // Act
    act(() => {
      result.current.increment();
    });

    // Assert
    expect(result.current.count).toBe(1);
  });

  it('should decrement counter', () => {
    // Arrange
    const { result } = renderHook(() => useCounter(5));

    // Act
    act(() => {
      result.current.decrement();
    });

    // Assert
    expect(result.current.count).toBe(4);
  });
});
```

### API Mocking with MSW
```javascript
// src/test/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
      })
    );
  }),
  
  rest.post('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: '123', ...req.body })
    );
  }),
  
  rest.patch('/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ id: req.params.id, ...req.body })
    );
  }),
];

// src/test/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

## Cypress End-to-End Testing

### Cypress Configuration
```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  env: {
    apiUrl: 'http://localhost:3000/api',
  },
});
```

### Page Object Pattern

**Sample selectors.json file:**
```json
{
  "loginPage": {
    "emailInput": "[data-cy=\"email-input\"]",
    "passwordInput": "[data-cy=\"password-input\"]",
    "loginButton": "[data-cy=\"login-button\"]",
    "errorMessage": "[data-cy=\"error-message\"]",
    "loadingSpinner": "[data-cy=\"loading-spinner\"]"
  },
  "dashboardPage": {
    "welcomeMessage": "[data-cy=\"welcome-message\"]",
    "userAvatar": "[data-cy=\"user-avatar\"]",
    "logoutButton": "[data-cy=\"logout-button\"]",
    "navigationMenu": "[data-cy=\"navigation-menu\"]",
    "settingsLink": "[data-cy=\"settings-link\"]"
  },
  "userProfilePage": {
    "profileForm": "[data-cy=\"profile-form\"]",
    "nameInput": "[data-cy=\"name-input\"]",
    "emailInput": "[data-cy=\"email-input\"]",
    "saveButton": "[data-cy=\"save-button\"]",
    "cancelButton": "[data-cy=\"cancel-button\"]"
  }
}
```

```javascript
// cypress/pageobjects/LoginPage.js
import selectors from './selectors.json';

class LoginPage {
  constructor() {
    // Load selectors from JSON file
    this.selectors = selectors.loginPage;
  }

  visit() {
    cy.visit('/login');
    return this;
  }

  enterEmail(email) {
    cy.get(this.selectors.emailInput).clear().type(email);
    return this;
  }

  enterPassword(password) {
    cy.get(this.selectors.passwordInput).clear().type(password);
    return this;
  }

  clickLogin() {
    cy.get(this.selectors.loginButton).click();
    return this;
  }

  submitForm(email, password) {
    this.enterEmail(email)
        .enterPassword(password)
        .clickLogin();
    return this;
  }

  verifyErrorMessage(message) {
    cy.get(this.selectors.errorMessage)
      .should('be.visible')
      .and('contain.text', message);
    return this;
  }

  verifyRedirectToDashboard() {
    cy.url().should('include', '/dashboard');
    return this;
  }

  verifyLoadingState() {
    cy.get(this.selectors.loadingSpinner).should('be.visible');
    return this;
  }

  waitForPageLoad() {
    cy.get(this.selectors.emailInput).should('be.visible');
    return this;
  }
}

export default LoginPage;

// cypress/pageobjects/DashboardPage.js
import selectors from './selectors.json';

class DashboardPage {
  constructor() {
    // Load selectors from JSON file
    this.selectors = selectors.dashboardPage;
  }

  verifyPageLoaded() {
    cy.get(this.selectors.welcomeMessage).should('be.visible');
    return this;
  }

  verifyUserLoggedIn(username) {
    cy.get(this.selectors.welcomeMessage)
      .should('contain.text', `Welcome, ${username}`);
    return this;
  }

  clickSettings() {
    cy.get(this.selectors.settingsLink).click();
    return this;
  }

  logout() {
    cy.get(this.selectors.logoutButton).click();
    return this;
  }
}

export default DashboardPage;
```

### Cypress Test Examples
```javascript
// cypress/e2e/auth/login.cy.js
import LoginPage from '../../pageobjects/LoginPage';
import DashboardPage from '../../pageobjects/DashboardPage';

describe('User Authentication', () => {
  let loginPage;
  let dashboardPage;

  beforeEach(() => {
    loginPage = new LoginPage();
    dashboardPage = new DashboardPage();
    
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Mock API responses
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { token: 'mock-jwt-token', user: { id: 1, name: 'John Doe' } },
    }).as('loginRequest');
  });

  it('should login with valid credentials', () => {
    // Arrange & Act
    loginPage
      .visit()
      .waitForPageLoad()
      .submitForm('john.doe@example.com', 'password123');

    // Assert
    cy.wait('@loginRequest');
    dashboardPage
      .verifyPageLoaded()
      .verifyUserLoggedIn('John Doe');
  });

  it('should show error for invalid credentials', () => {
    // Arrange
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginError');

    // Act
    loginPage
      .visit()
      .waitForPageLoad()
      .submitForm('invalid@example.com', 'wrongpassword');

    // Assert
    cy.wait('@loginError');
    loginPage.verifyErrorMessage('Invalid credentials');
  });

  it('should show loading state during login', () => {
    // Arrange
    cy.intercept('POST', '/api/auth/login', (req) => {
      // Delay response to test loading state
      req.reply({ delay: 1000, statusCode: 200, body: { token: 'token' } });
    }).as('slowLogin');

    // Act
    loginPage
      .visit()
      .waitForPageLoad()
      .enterEmail('john@example.com')
      .enterPassword('password')
      .clickLogin();

    // Assert
    loginPage.verifyLoadingState();
    cy.wait('@slowLogin');
  });
});

// cypress/e2e/navigation/dashboard.cy.js
import LoginPage from '../../pageobjects/LoginPage';
import DashboardPage from '../../pageobjects/DashboardPage';

describe('Dashboard Navigation', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('john.doe@example.com', 'password123');
  });

  it('should navigate to settings page', () => {
    const dashboardPage = new DashboardPage();
    
    dashboardPage
      .verifyPageLoaded()
      .clickSettings();
    
    cy.url().should('include', '/settings');
  });

  it('should logout successfully', () => {
    const dashboardPage = new DashboardPage();
    const loginPage = new LoginPage();
    
    dashboardPage
      .verifyPageLoaded()
      .logout();
    
    cy.url().should('include', '/login');
    loginPage.waitForPageLoad();
  });
});
```

---

## Build & Test Commands

```bash
# Development
npm install                    # Install dependencies
npm start                      # Start dev server (port 8080+)
npm run start:onprem          # Start hybrid/on-prem mode

# Building
npm run build                 # Production build (both targets)
npm run build:base            # Build for cloud deployment
npm run build:onprem          # Build for hybrid/on-prem

# Testing
npm test                 # Run Jest unit tests
npm run coverage         # Run tests with coverage report

# Code Quality
npm run lint                   # Run ESLint

# Cypress
npm run headless:base  # Run all cloud tests in headless mode with Cypress
npm run headless:onprem # Run all hybrid/OnPrem hybrid tests with Cypress
```

---

## Common Pitfalls & Solutions

| Pitfall                          | Solution                                             | Example                                                    |
| -------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Prop drilling                    | Use Context API or state management (Redux)          | `const { user } = useSelector(state => state.user)`        |
| useEffect dependency issues      | Include all dependencies, use ESLint plugin          | `useEffect(() => {}, [userId, isActive])`                  |
| Memory leaks in async operations | Cleanup with AbortController or cancellation flags   | `useEffect(() => { let cancelled = false; })`              |
| Unnecessary re-renders           | Use React.memo, useMemo, useCallback strategically   | `const expensiveValue = useMemo(() => calculate(), [dep])` |
| Missing keys in lists            | Always provide stable unique keys                    | `items.map(item => <Item key={item.id} />)`                |
| State mutations                  | Use immutable updates with spread/Object.assign      | `setState(prev => ({ ...prev, count: prev.count + 1 }))`   |
| Async state race conditions      | Use cleanup or latest request pattern                | `startTransition(() => setData(newData))`                  |
| Bundle size bloat                | Code splitting, tree shaking, analyze bundles        | `const Component = lazy(() => import('./Component'))`      |
| SEO issues with SPA              | Use React Router with proper meta tags               | `<Helmet><title>Page Title</title></Helmet>`               |
| Accessibility violations         | Use semantic HTML, ARIA attributes, focus management | `<button aria-label="Close dialog" onClick={close}>`       |
| Testing async components         | Use waitFor, proper test isolation                   | `await waitFor(() => screen.getByText('Loaded'))`          |
| Webpack config complexity        | Separate dev/prod configs, use composition           | `module.exports = merge(base, devConfig)`                  |
