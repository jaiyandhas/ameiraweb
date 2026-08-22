import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.auth import VerifiedUser, verify_jwt_token

# Mock verified user fixture
def get_mock_owner():
    return VerifiedUser(
        user_id="usr-owner-123",
        email="owner@store.com",
        person_id="psn-owner-123",
        business_id="biz-test-123",
        role_id="role-owner",
        role_name="Owner",
        capabilities={"canManagePeople", "canManageRoles", "canViewBusinessSettings", "canEditBusinessSettings"}
    )

def get_mock_staff():
    return VerifiedUser(
        user_id="usr-staff-456",
        email="staff@store.com",
        person_id="psn-staff-456",
        business_id="biz-test-123",
        role_id="role-staff",
        role_name="Staff",
        capabilities=set()
    )

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ameira-capability-enforcement"

@pytest.mark.asyncio
async def test_staff_cannot_create_role():
    # Staff without canManageRoles capability is rejected with 403 Forbidden
    app.dependency_overrides[verify_jwt_token] = get_mock_staff
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(
                "/api/roles",
                json={"name": "Hacker Role", "description": "Unauthorized", "capabilities": ["canManageRoles"]}
            )
            assert res.status_code == 403
            assert "Access denied" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_staff_cannot_change_role():
    # Staff cannot change roles
    app.dependency_overrides[verify_jwt_token] = get_mock_staff
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(
                "/api/people/psn-target-123/role",
                json={"role_id": "role-owner"}
            )
            assert res.status_code == 403
    finally:
        app.dependency_overrides.clear()
