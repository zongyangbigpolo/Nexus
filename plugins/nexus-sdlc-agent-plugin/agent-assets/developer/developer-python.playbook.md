# Python Stack Playbook

Stack-specific patterns for Python projects (FastAPI, Django, Flask).

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables, Functions | snake_case | `get_user_by_id`, `user_id` |
| Classes | PascalCase | `UserService`, `UserRepository` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| Modules, Files | snake_case | `user_service.py`, `auth_controller.py` |
| Private | _prefix | `_internal_method`, `_cache` |

---

## Project Structure

```
src/
├── api/                # Route handlers (FastAPI routers / Django views)
├── services/           # Business logic
├── repositories/       # Data access
├── models/             # Pydantic models / Django models
├── schemas/            # Request/Response DTOs
├── core/               # Config, dependencies
└── main.py             # Entry point

tests/
├── unit/               # Unit tests
├── integration/        # API tests
└── conftest.py         # Fixtures
```

---

## Common Patterns

### Type Hints
```python
from typing import Optional, List
from pydantic import BaseModel

class User(BaseModel):
    id: int
    email: str
    name: str

class CreateUserDto(BaseModel):
    email: str
    name: str

async def get_user_by_id(user_id: int) -> Optional[User]:
    ...

def get_users(limit: int = 10) -> List[User]:
    ...
```

### FastAPI Router
```python
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
) -> User:
    user = await user_service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### Dependency Injection
```python
from functools import lru_cache
from fastapi import Depends

@lru_cache
def get_settings() -> Settings:
    return Settings()

def get_db_session(settings: Settings = Depends(get_settings)) -> Session:
    return SessionLocal()

def get_user_service(
    session: Session = Depends(get_db_session)
) -> UserService:
    return UserService(UserRepository(session))
```

---

## Testing (pytest)

```python
import pytest
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
def mock_repository():
    return MagicMock()

@pytest.fixture
def user_service(mock_repository):
    return UserService(mock_repository)

class TestUserService:
    async def test_get_by_id_returns_user_when_exists(
        self, user_service, mock_repository
    ):
        # Arrange
        mock_repository.get_by_id = AsyncMock(
            return_value=User(id=1, name="Test", email="test@example.com")
        )

        # Act
        result = await user_service.get_by_id(1)

        # Assert
        assert result is not None
        assert result.id == 1
        mock_repository.get_by_id.assert_called_once_with(1)

    async def test_get_by_id_returns_none_when_not_exists(
        self, user_service, mock_repository
    ):
        # Arrange
        mock_repository.get_by_id = AsyncMock(return_value=None)

        # Act
        result = await user_service.get_by_id(999)

        # Assert
        assert result is None
```

---

## Build & Test Commands

```bash
# Install dependencies
pip install -r requirements.txt
# or with poetry
poetry install

# Run tests
pytest

# Run tests with coverage
pytest --cov=src --cov-report=html

# Type check
mypy src/

# Lint
ruff check src/
# or
flake8 src/

# Format
black src/
```

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Missing type hints | Use `mypy` with strict mode |
| Mutable default args | Use `None` default, assign in body |
| Not closing resources | Use context managers (`with`) or `finally` |
| Sync in async context | Use `asyncio.to_thread()` for blocking calls |
| Circular imports | Import inside functions or use TYPE_CHECKING |
