# Go Stack Playbook

Stack-specific patterns for Go projects.

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Exported (public) | PascalCase | `GetUserByID`, `UserService` |
| Unexported (private) | camelCase | `getUserByID`, `userRepository` |
| Packages | lowercase, single word | `user`, `auth`, `config` |
| Interfaces | -er suffix (when applicable) | `Reader`, `UserRepository` |
| Acronyms | All caps | `ID`, `HTTP`, `URL` |
| Files | snake_case | `user_service.go`, `user_test.go` |

---

## Project Structure

```
cmd/
└── api/
    └── main.go          # Entry point

internal/
├── handler/             # HTTP handlers
├── service/             # Business logic
├── repository/          # Data access
├── model/               # Domain types
└── config/              # Configuration

pkg/                     # Public packages (if any)

tests/
└── integration/         # Integration tests
```

---

## Common Patterns

### Interface Definition
```go
// Define interfaces where they're used, not where implemented
type UserRepository interface {
    GetByID(ctx context.Context, id int64) (*User, error)
    Create(ctx context.Context, user *User) error
}

type UserService struct {
    repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}
```

### Error Handling
```go
// ✅ Good - wrap errors with context
func (s *UserService) GetByID(ctx context.Context, id int64) (*User, error) {
    user, err := s.repo.GetByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("get user by id %d: %w", id, err)
    }
    return user, nil
}

// ❌ Bad - losing error context
func (s *UserService) GetByID(ctx context.Context, id int64) (*User, error) {
    user, err := s.repo.GetByID(ctx, id)
    if err != nil {
        return nil, err // Lost context
    }
    return user, nil
}
```

### HTTP Handler
```go
func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    idStr := chi.URLParam(r, "id")
    id, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil {
        http.Error(w, "invalid user id", http.StatusBadRequest)
        return
    }

    user, err := h.service.GetByID(r.Context(), id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            http.Error(w, "user not found", http.StatusNotFound)
            return
        }
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}
```

---

## Testing

```go
package service_test

import (
    "context"
    "testing"
    
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

type MockUserRepository struct {
    mock.Mock
}

func (m *MockUserRepository) GetByID(ctx context.Context, id int64) (*User, error) {
    args := m.Called(ctx, id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*User), args.Error(1)
}

func TestUserService_GetByID(t *testing.T) {
    t.Run("returns user when exists", func(t *testing.T) {
        // Arrange
        mockRepo := new(MockUserRepository)
        mockRepo.On("GetByID", mock.Anything, int64(1)).
            Return(&User{ID: 1, Name: "Test"}, nil)
        
        svc := NewUserService(mockRepo)

        // Act
        user, err := svc.GetByID(context.Background(), 1)

        // Assert
        assert.NoError(t, err)
        assert.NotNil(t, user)
        assert.Equal(t, int64(1), user.ID)
        mockRepo.AssertExpectations(t)
    })

    t.Run("returns error when not exists", func(t *testing.T) {
        // Arrange
        mockRepo := new(MockUserRepository)
        mockRepo.On("GetByID", mock.Anything, int64(999)).
            Return(nil, ErrNotFound)
        
        svc := NewUserService(mockRepo)

        // Act
        user, err := svc.GetByID(context.Background(), 999)

        // Assert
        assert.ErrorIs(t, err, ErrNotFound)
        assert.Nil(t, user)
    })
}
```

---

## Build & Test Commands

```bash
# Build
go build ./...

# Run tests
go test ./...

# Run tests with coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Run specific package tests
go test ./internal/service/...

# Lint
golangci-lint run

# Format
gofmt -w .
```

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Not handling errors | Check `if err != nil` immediately after each function call that returns an error |
| Goroutine leaks | Use context for cancellation |
| Data races | Use mutexes or channels |
| Nil pointer dereference | Check for nil before dereferencing |
| Import cycles | Restructure packages, use interfaces |
