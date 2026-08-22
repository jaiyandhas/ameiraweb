import pytest
from httpx import AsyncClient, ASGITransport, Response
from backend.main import app
from backend.auth import VerifiedUser, verify_jwt_token
from backend.database import get_http_client
import backend.routers.people as people_router
import backend.routers.roles as roles_router
import backend.routers.invites as invites_router

# ─── Mock User Fixtures ───────────────────────────────────────────────────────

def get_mock_owner():
    return VerifiedUser(
        user_id="usr-owner-1",
        email="owner1@business.com",
        person_id="psn-owner-1",
        business_id="biz-main-100",
        role_id="role-owner",
        role_name="Owner",
        capabilities={"canManagePeople", "canManageRoles", "canViewBusinessSettings", "canEditBusinessSettings"}
    )

def get_mock_staff():
    return VerifiedUser(
        user_id="usr-staff-1",
        email="staff1@business.com",
        person_id="psn-staff-1",
        business_id="biz-main-100",
        role_id="role-staff",
        role_name="Staff",
        capabilities=set()
    )

# ─── 0. Base Health Check & Capability Tests ──────────────────────────────────

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
    app.dependency_overrides[verify_jwt_token] = get_mock_staff
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(
                "/api/people/psn-target-123/role",
                json={"role_id": "role-owner"}
            )
            assert res.status_code == 403
            assert "Access denied" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_staff_cannot_remove_person():
    app.dependency_overrides[verify_jwt_token] = get_mock_staff
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post("/api/people/psn-target-123/remove")
            assert res.status_code == 403
            assert "Access denied" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

# ─── 1. Sole-Owner Demotion Lockout Tests ─────────────────────────────────────

@pytest.mark.asyncio
async def test_sole_owner_demotion_lockout_rejected(monkeypatch):
    """Attempting to demote the only active Owner in a business must be rejected with HTTP 400."""
    app.dependency_overrides[verify_jwt_token] = get_mock_owner
    
    # Mock HTTP client responses simulating single owner state
    class MockHttpClient:
        async def get(self, url, headers=None):
            if "people?id=eq.psn-owner-1" in url:
                return Response(200, json=[{
                    "id": "psn-owner-1",
                    "full_name": "Ramesh Owner",
                    "business_id": "biz-main-100",
                    "role_id": "role-owner",
                    "status": "active"
                }])
            elif "roles?id=eq.role-staff" in url:
                return Response(200, json=[{"id": "role-staff", "name": "Staff"}])
            elif "roles?id=eq.role-owner" in url:
                return Response(200, json=[{"id": "role-owner", "name": "Owner"}])
            elif "people?business_id=eq.biz-main-100" in url:
                # Only 1 active owner exists
                return Response(200, json=[
                    {"role_id": "role-owner", "roles": {"name": "Owner"}},
                    {"role_id": "role-staff", "roles": {"name": "Staff"}}
                ])
            return Response(404, json=[])

    monkeypatch.setattr(people_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(
                "/api/people/psn-owner-1/role",
                json={"role_id": "role-staff"}
            )
            assert res.status_code == 400
            assert "sole active Owner" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_two_owners_demotion_succeeds(monkeypatch):
    """When two active Owners exist, demoting one Owner must succeed."""
    app.dependency_overrides[verify_jwt_token] = get_mock_owner

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "people?id=eq.psn-owner-2" in url:
                return Response(200, json=[{
                    "id": "psn-owner-2",
                    "full_name": "Suresh Co-Owner",
                    "business_id": "biz-main-100",
                    "role_id": "role-owner",
                    "status": "active"
                }])
            elif "roles?id=eq.role-staff" in url:
                return Response(200, json=[{"id": "role-staff", "name": "Staff"}])
            elif "roles?id=eq.role-owner" in url:
                return Response(200, json=[{"id": "role-owner", "name": "Owner"}])
            elif "people?business_id=eq.biz-main-100" in url:
                # 2 active owners exist!
                return Response(200, json=[
                    {"role_id": "role-owner", "roles": {"name": "Owner"}},
                    {"role_id": "role-owner", "roles": {"name": "Owner"}}
                ])
            return Response(404, json=[])

        async def patch(self, url, json=None, headers=None):
            return Response(200, json=[])

        async def post(self, url, json=None, headers=None):
            return Response(201, json=[])

    monkeypatch.setattr(people_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(
                "/api/people/psn-owner-2/role",
                json={"role_id": "role-staff"}
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["role_name"] == "Staff"
    finally:
        app.dependency_overrides.clear()

# ─── 2. Sole-Owner Removal Lockout Tests ──────────────────────────────────────

@pytest.mark.asyncio
async def test_sole_owner_removal_lockout_rejected(monkeypatch):
    """Attempting to remove the only active Owner must be rejected with HTTP 400."""
    app.dependency_overrides[verify_jwt_token] = get_mock_owner

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "people?id=eq.psn-owner-1" in url:
                return Response(200, json=[{
                    "id": "psn-owner-1",
                    "full_name": "Ramesh Owner",
                    "business_id": "biz-main-100",
                    "role_id": "role-owner",
                    "status": "active",
                    "roles": {"name": "Owner"}
                }])
            elif "people?business_id=eq.biz-main-100" in url:
                return Response(200, json=[
                    {"roles": {"name": "Owner"}}
                ])
            return Response(404, json=[])

    monkeypatch.setattr(people_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post("/api/people/psn-owner-1/remove")
            assert res.status_code == 400
            assert "sole active Owner" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_two_owners_removal_succeeds(monkeypatch):
    """When two Owners exist, removing one must succeed."""
    app.dependency_overrides[verify_jwt_token] = get_mock_owner

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "people?id=eq.psn-owner-2" in url:
                return Response(200, json=[{
                    "id": "psn-owner-2",
                    "full_name": "Suresh Co-Owner",
                    "business_id": "biz-main-100",
                    "role_id": "role-owner",
                    "status": "active",
                    "roles": {"name": "Owner"}
                }])
            elif "people?business_id=eq.biz-main-100" in url:
                return Response(200, json=[
                    {"roles": {"name": "Owner"}},
                    {"roles": {"name": "Owner"}}
                ])
            return Response(404, json=[])

        async def delete(self, url, headers=None):
            return Response(200, json=[])

        async def post(self, url, json=None, headers=None):
            return Response(201, json=[])

    monkeypatch.setattr(people_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post("/api/people/psn-owner-2/remove")
            assert res.status_code == 200
            assert res.json()["success"] is True
    finally:
        app.dependency_overrides.clear()

# ─── 3. Preset Role Immutability Tests (Edit) ─────────────────────────────────

@pytest.mark.asyncio
async def test_preset_role_edit_immutable_rejected(monkeypatch):
    """Attempting to PATCH a system standard preset role must be rejected."""
    app.dependency_overrides[verify_jwt_token] = get_mock_owner

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "roles?id=eq.role-owner" in url:
                return Response(200, json=[{
                    "id": "role-owner",
                    "name": "Owner",
                    "is_preset": True,
                    "business_id": "biz-main-100"
                }])
            return Response(404, json=[])

    monkeypatch.setattr(roles_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.patch(
                "/api/roles/role-owner",
                json={"name": "Hacked Owner", "description": "Modified"}
            )
            assert res.status_code == 400
            assert "System standard access levels cannot be modified" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_custom_role_edit_succeeds(monkeypatch):
    """Editing a custom non-preset role must succeed."""
    app.dependency_overrides[verify_jwt_token] = get_mock_owner

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "roles?id=eq.role-custom-1" in url:
                return Response(200, json=[{
                    "id": "role-custom-1",
                    "name": "Supervisor",
                    "is_preset": False,
                    "business_id": "biz-main-100"
                }])
            elif "capabilities?key=in" in url:
                return Response(200, json=[{"id": "cap-1", "key": "canManagePeople"}])
            return Response(404, json=[])

        async def patch(self, url, json=None, headers=None):
            return Response(200, json=[])

        async def delete(self, url, headers=None):
            return Response(200, json=[])

        async def post(self, url, json=None, headers=None):
            return Response(201, json=[])

    monkeypatch.setattr(roles_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.patch(
                "/api/roles/role-custom-1",
                json={"name": "Lead Supervisor", "description": "Updated", "capabilities": ["canManagePeople"]}
            )
            assert res.status_code == 200
            assert res.json()["name"] == "Lead Supervisor"
    finally:
        app.dependency_overrides.clear()

# ─── 4. Preset Role Immutability Tests (Delete) ───────────────────────────────

@pytest.mark.asyncio
async def test_preset_role_delete_immutable_rejected(monkeypatch):
    """Attempting to DELETE a system standard preset role must be rejected."""
    app.dependency_overrides[verify_jwt_token] = get_mock_owner

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "roles?id=eq.role-owner" in url:
                return Response(200, json=[{
                    "id": "role-owner",
                    "name": "Owner",
                    "is_preset": True,
                    "business_id": "biz-main-100"
                }])
            return Response(404, json=[])

    monkeypatch.setattr(roles_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.delete("/api/roles/role-owner")
            assert res.status_code == 400
            assert "System standard access levels cannot be deleted" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

# ─── 5. Role Deletion with Active Assignees Tests ─────────────────────────────

@pytest.mark.asyncio
async def test_custom_role_delete_with_active_assignees_rejected(monkeypatch):
    """Attempting to delete a custom role with assigned members must be rejected."""
    app.dependency_overrides[verify_jwt_token] = get_mock_owner

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "roles?id=eq.role-custom-1" in url:
                return Response(200, json=[{
                    "id": "role-custom-1",
                    "name": "Shift Lead",
                    "is_preset": False,
                    "business_id": "biz-main-100"
                }])
            elif "people?role_id=eq.role-custom-1" in url:
                # 2 people currently hold this role!
                return Response(200, json=[{"id": "psn-1"}, {"id": "psn-2"}])
            return Response(404, json=[])

    monkeypatch.setattr(roles_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.delete("/api/roles/role-custom-1")
            assert res.status_code == 400
            assert "while 2 team member(s) are assigned to it" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_custom_role_delete_with_zero_assignees_succeeds(monkeypatch):
    """Deleting an empty custom role with 0 assignees must succeed."""
    app.dependency_overrides[verify_jwt_token] = get_mock_owner

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "roles?id=eq.role-custom-empty" in url:
                return Response(200, json=[{
                    "id": "role-custom-empty",
                    "name": "Unused Role",
                    "is_preset": False,
                    "business_id": "biz-main-100"
                }])
            elif "people?role_id=eq.role-custom-empty" in url:
                # 0 people assigned!
                return Response(200, json=[])
            return Response(404, json=[])

        async def delete(self, url, headers=None):
            return Response(200, json=[])

        async def post(self, url, json=None, headers=None):
            return Response(201, json=[])

    monkeypatch.setattr(roles_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.delete("/api/roles/role-custom-empty")
            assert res.status_code == 200
            assert res.json()["deleted_role_id"] == "role-custom-empty"
    finally:
        app.dependency_overrides.clear()

# ─── 6. Invite Acceptance Identity Mismatch Tests ─────────────────────────────

@pytest.mark.asyncio
async def test_invite_acceptance_identity_mismatch_rejected(monkeypatch):
    """An invite addressed to person-a@example.com must NOT be acceptable by person-b@example.com."""
    # Authenticated user is person-b
    user_b = VerifiedUser(
        user_id="usr-b-999",
        email="person-b@example.com",
        person_id=None,
        business_id=None,
        role_id=None,
        role_name="Guest",
        capabilities=set()
    )
    app.dependency_overrides[verify_jwt_token] = lambda: user_b

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "people?id=eq.inv-target-1" in url:
                return Response(200, json=[{
                    "id": "inv-target-1",
                    "business_id": "biz-main-100",
                    "full_name": "Person A",
                    "email_or_phone": "person-a@example.com",
                    "status": "invited"
                }])
            return Response(404, json=[])

    monkeypatch.setattr(invites_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post("/api/invites/inv-target-1/accept")
            assert res.status_code == 403
            assert "person-a@example.com" in res.json()["detail"]
            assert "person-b@example.com" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_invite_acceptance_identity_match_succeeds(monkeypatch):
    """An invite addressed to person-a@example.com accepted by person-a@example.com must succeed."""
    user_a = VerifiedUser(
        user_id="usr-a-111",
        email="person-a@example.com",
        person_id=None,
        business_id=None,
        role_id=None,
        role_name="Guest",
        capabilities=set()
    )
    app.dependency_overrides[verify_jwt_token] = lambda: user_a

    class MockHttpClient:
        async def get(self, url, headers=None):
            if "people?id=eq.inv-target-1" in url:
                return Response(200, json=[{
                    "id": "inv-target-1",
                    "business_id": "biz-main-100",
                    "full_name": "Person A",
                    "email_or_phone": "person-a@example.com",
                    "status": "invited"
                }])
            return Response(404, json=[])

        async def patch(self, url, json=None, headers=None):
            return Response(200, json=[])

        async def post(self, url, json=None, headers=None):
            return Response(201, json=[])

    monkeypatch.setattr(invites_router, "get_http_client", lambda: MockHttpClient())

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post("/api/invites/inv-target-1/accept")
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["status"] == "active"
            assert data["person_id"] == "inv-target-1"
    finally:
        app.dependency_overrides.clear()
