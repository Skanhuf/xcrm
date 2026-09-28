import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_async_session
from app.core.config import settings

# Test database
TEST_DATABASE_URL = "postgresql+psycopg2://xcrm:xcrm_secret@localhost:5432/xcrm_test"
engine = create_async_engine(TEST_DATABASE_URL)
test_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="function")
async def db_session():
    """Create test database session."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with test_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session):
    """Create test client with test database."""
    async def override_get_session():
        yield db_session

    app.dependency_overrides[get_async_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_health(client):
    """Test health endpoint."""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_login_invalid(client):
    """Test login with invalid credentials."""
    response = await client.post("/api/auth/login", json={
        "login": "wrong",
        "password": "wrong"
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_register_and_login(client):
    """Test register then login."""
    # Register
    response = await client.post("/api/auth/register", json={
        "name": "Test User",
        "login": "testuser",
        "password": "testpass123"
    })
    assert response.status_code == 201
    assert response.json()["role"] == "admin"

    # Login
    response = await client.post("/api/auth/login", json={
        "login": "testuser",
        "password": "testpass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_clients_crud(client):
    """Test clients CRUD."""
    # Register user first
    await client.post("/api/auth/register", json={
        "name": "Test User",
        "login": "testuser",
        "password": "testpass123"
    })

    # Login
    login_resp = await client.post("/api/auth/login", json={
        "login": "testuser",
        "password": "testpass123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create client
    response = await client.post("/api/clients", json={
        "name": "John Doe",
        "phone": "+79991234567",
        "email": "john@test.com"
    }, headers=headers)
    assert response.status_code == 201
    client_id = response.json()["id"]

    # Get clients
    response = await client.get("/api/clients", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Update client
    response = await client.put(f"/api/clients/{client_id}", json={
        "name": "John Updated"
    }, headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "John Updated"

    # Delete client
    response = await client.delete(f"/api/clients/{client_id}", headers=headers)
    assert response.status_code == 204
