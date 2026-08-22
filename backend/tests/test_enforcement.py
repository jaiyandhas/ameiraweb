import pytest
import asyncio
import os
import asyncpg
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.auth import VerifiedUser, verify_jwt_token
from backend.config import settings
import backend.database as db_module

TEST_DB_URL = os.getenv("TEST_DATABASE_URL", "postgresql://postgres@localhost:54332/ameira_test")

@pytest.fixture(autouse=True)
async def setup_test_database():
    # Configure real database URL for testing
    settings.DATABASE_URL = TEST_DB_URL
    await db_module.init_db_pool()
    pool = db_module.get_pool()
    assert pool is not None, "Real asyncpg connection pool must be initialized for test suite"

    # Clean test data from tenant tables before each test
    async with pool.acquire() as conn:
        await conn.execute("""
            DELETE FROM public.activity_events;
            DELETE FROM public.business_installed_apps;
            DELETE FROM public.people;
            DELETE FROM public.role_capabilities WHERE role_id NOT IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');
            DELETE FROM public.roles WHERE is_preset = false;
            DELETE FROM public.businesses;
        """)

    yield pool

    # Teardown
    await db_module.close_db_pool()

# ─── Helper to seed real test tenant ──────────────────────────────────────────

async def seed_test_tenant(pool: asyncpg.Pool, num_owners: int = 1):
    owner_role_id = "00000000-0000-0000-0000-000000000001"
    staff_role_id = "00000000-0000-0000-0000-000000000003"

    async with pool.acquire() as conn:
        # Create test business
        biz_id = await conn.fetchval(
            "INSERT INTO public.businesses (name) VALUES ('Apex Store Test') RETURNING id"
        )
        biz_id_str = str(biz_id)

        # Create Owner 1
        owner1_id = await conn.fetchval(
            """
            INSERT INTO public.people (business_id, full_name, email_or_phone, role_id, status)
            VALUES ($1, 'Ramesh Owner', 'ramesh@apex.com', $2, 'active')
            RETURNING id
            """,
            biz_id, owner_role_id
        )

        owner2_id = None
        if num_owners >= 2:
            owner2_id = await conn.fetchval(
                """
                INSERT INTO public.people (business_id, full_name, email_or_phone, role_id, status)
                VALUES ($1, 'Suresh Co-Owner', 'suresh@apex.com', $2, 'active')
                RETURNING id
                """,
                biz_id, owner_role_id
            )

        # Create Staff member
        staff_id = await conn.fetchval(
            """
            INSERT INTO public.people (business_id, full_name, email_or_phone, role_id, status)
            VALUES ($1, 'Kumar Staff', 'kumar@apex.com', $2, 'active')
            RETURNING id
            """,
            biz_id, staff_role_id
        )

        return {
            "business_id": biz_id_str,
            "owner1_id": str(owner1_id),
            "owner2_id": str(owner2_id) if owner2_id else None,
            "staff_id": str(staff_id),
            "owner_role_id": owner_role_id,
            "staff_role_id": staff_role_id,
        }

# ─── 0. Base Health Check & Capability Rejection Tests ────────────────────────

@pytest.mark.asyncio
async def test_health_check(setup_test_database):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["pool_active"] is True

@pytest.mark.asyncio
async def test_staff_cannot_create_role(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    user = VerifiedUser(
        user_id="usr-staff-1",
        email="kumar@apex.com",
        person_id=tenant["staff_id"],
        business_id=tenant["business_id"],
        role_id=tenant["staff_role_id"],
        role_name="Staff",
        capabilities=set()
    )
    app.dependency_overrides[verify_jwt_token] = lambda: user
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
async def test_staff_cannot_change_role(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    user = VerifiedUser(
        user_id="usr-staff-1",
        email="kumar@apex.com",
        person_id=tenant["staff_id"],
        business_id=tenant["business_id"],
        role_id=tenant["staff_role_id"],
        role_name="Staff",
        capabilities=set()
    )
    app.dependency_overrides[verify_jwt_token] = lambda: user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(
                f"/api/people/{tenant['staff_id']}/role",
                json={"role_id": tenant["owner_role_id"]}
            )
            assert res.status_code == 403
            assert "Access denied" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_staff_cannot_remove_person(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    user = VerifiedUser(
        user_id="usr-staff-1",
        email="kumar@apex.com",
        person_id=tenant["staff_id"],
        business_id=tenant["business_id"],
        role_id=tenant["staff_role_id"],
        role_name="Staff",
        capabilities=set()
    )
    app.dependency_overrides[verify_jwt_token] = lambda: user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(f"/api/people/{tenant['owner1_id']}/remove")
            assert res.status_code == 403
            assert "Access denied" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

# ─── 1. Sole-Owner Demotion Lockout Tests (Real DB) ───────────────────────────

@pytest.mark.asyncio
async def test_sole_owner_demotion_lockout_rejected(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool, num_owners=1)

    owner_user = VerifiedUser(
        user_id="usr-owner-1",
        email="ramesh@apex.com",
        person_id=tenant["owner1_id"],
        business_id=tenant["business_id"],
        role_id=tenant["owner_role_id"],
        role_name="Owner",
        capabilities={"canManagePeople", "canManageRoles"}
    )
    app.dependency_overrides[verify_jwt_token] = lambda: owner_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Attempt to demote the only owner
            res = await client.post(
                f"/api/people/{tenant['owner1_id']}/role",
                json={"role_id": tenant["staff_role_id"]}
            )
            assert res.status_code == 400
            assert "sole active Owner" in res.json()["detail"]

            # Confirm person is STILL an Owner in real DB
            async with pool.acquire() as conn:
                role_id = await conn.fetchval("SELECT role_id FROM public.people WHERE id = $1", tenant["owner1_id"])
                assert str(role_id) == tenant["owner_role_id"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_two_owners_demotion_succeeds(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool, num_owners=2)

    owner_user = VerifiedUser(
        user_id="usr-owner-1",
        email="ramesh@apex.com",
        person_id=tenant["owner1_id"],
        business_id=tenant["business_id"],
        role_id=tenant["owner_role_id"],
        role_name="Owner",
        capabilities={"canManagePeople", "canManageRoles"}
    )
    app.dependency_overrides[verify_jwt_token] = lambda: owner_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Demote owner 2 to staff (owner 1 still remains)
            res = await client.post(
                f"/api/people/{tenant['owner2_id']}/role",
                json={"role_id": tenant["staff_role_id"]}
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["role_name"] == "Staff"

            # Confirm in real DB
            async with pool.acquire() as conn:
                role_id = await conn.fetchval("SELECT role_id FROM public.people WHERE id = $1", tenant["owner2_id"])
                assert str(role_id) == tenant["staff_role_id"]

                # Activity event was written
                event_count = await conn.fetchval(
                    "SELECT COUNT(*) FROM public.activity_events WHERE business_id = $1 AND event_type = 'role_assigned'",
                    tenant["business_id"]
                )
                assert event_count == 1
    finally:
        app.dependency_overrides.clear()

# ─── 2. Sole-Owner Removal Lockout Tests (Real DB) ────────────────────────────

@pytest.mark.asyncio
async def test_sole_owner_removal_lockout_rejected(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool, num_owners=1)

    owner_user = VerifiedUser(
        user_id="usr-owner-1",
        email="ramesh@apex.com",
        person_id=tenant["owner1_id"],
        business_id=tenant["business_id"],
        role_id=tenant["owner_role_id"],
        role_name="Owner",
        capabilities={"canManagePeople"}
    )
    app.dependency_overrides[verify_jwt_token] = lambda: owner_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(f"/api/people/{tenant['owner1_id']}/remove")
            assert res.status_code == 400
            assert "sole active Owner" in res.json()["detail"]

            # Confirm in real DB that owner record remains
            async with pool.acquire() as conn:
                exists = await conn.fetchval("SELECT COUNT(*) FROM public.people WHERE id = $1", tenant["owner1_id"])
                assert exists == 1
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_two_owners_removal_succeeds(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool, num_owners=2)

    owner_user = VerifiedUser(
        user_id="usr-owner-1",
        email="ramesh@apex.com",
        person_id=tenant["owner1_id"],
        business_id=tenant["business_id"],
        role_id=tenant["owner_role_id"],
        role_name="Owner",
        capabilities={"canManagePeople"}
    )
    app.dependency_overrides[verify_jwt_token] = lambda: owner_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(f"/api/people/{tenant['owner2_id']}/remove")
            assert res.status_code == 200
            assert res.json()["success"] is True

            # Confirm deletion in real DB
            async with pool.acquire() as conn:
                exists = await conn.fetchval("SELECT COUNT(*) FROM public.people WHERE id = $1", tenant["owner2_id"])
                assert exists == 0
    finally:
        app.dependency_overrides.clear()

# ─── 3. Preset Role Immutability Tests (Edit) ─────────────────────────────────

@pytest.mark.asyncio
async def test_preset_role_edit_immutable_rejected(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    owner_user = VerifiedUser(
        user_id="usr-owner-1",
        email="ramesh@apex.com",
        person_id=tenant["owner1_id"],
        business_id=tenant["business_id"],
        role_id=tenant["owner_role_id"],
        role_name="Owner",
        capabilities={"canManageRoles"}
    )
    app.dependency_overrides[verify_jwt_token] = lambda: owner_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.patch(
                f"/api/roles/{tenant['owner_role_id']}",
                json={"name": "Hacked Owner", "description": "Modified"}
            )
            assert res.status_code == 400
            assert "System standard access levels cannot be modified" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_custom_role_edit_succeeds(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    # Insert a custom role into real DB
    async with pool.acquire() as conn:
        custom_role_id = await conn.fetchval(
            """
            INSERT INTO public.roles (business_id, name, description, is_preset)
            VALUES ($1, 'Supervisor', 'Floor lead', false)
            RETURNING id
            """,
            tenant["business_id"]
        )

    owner_user = VerifiedUser(
        user_id="usr-owner-1",
        email="ramesh@apex.com",
        person_id=tenant["owner1_id"],
        business_id=tenant["business_id"],
        role_id=tenant["owner_role_id"],
        role_name="Owner",
        capabilities={"canManageRoles"}
    )
    app.dependency_overrides[verify_jwt_token] = lambda: owner_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.patch(
                f"/api/roles/{custom_role_id}",
                json={"name": "Senior Supervisor", "description": "Updated floor lead", "capabilities": ["canManagePeople"]}
            )
            assert res.status_code == 200
            assert res.json()["name"] == "Senior Supervisor"

            # Confirm real DB record updated
            async with pool.acquire() as conn:
                updated_name = await conn.fetchval("SELECT name FROM public.roles WHERE id = $1", custom_role_id)
                assert updated_name == "Senior Supervisor"
    finally:
        app.dependency_overrides.clear()

# ─── 4. Preset Role Immutability Tests (Delete) ───────────────────────────────

@pytest.mark.asyncio
async def test_preset_role_delete_immutable_rejected(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    owner_user = VerifiedUser(
        user_id="usr-owner-1",
        email="ramesh@apex.com",
        person_id=tenant["owner1_id"],
        business_id=tenant["business_id"],
        role_id=tenant["owner_role_id"],
        role_name="Owner",
        capabilities={"canManageRoles"}
    )
    app.dependency_overrides[verify_jwt_token] = lambda: owner_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.delete(f"/api/roles/{tenant['owner_role_id']}")
            assert res.status_code == 400
            assert "System standard access levels cannot be deleted" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()

# ─── 5. Role Deletion with Active Assignees Tests ─────────────────────────────

@pytest.mark.asyncio
async def test_custom_role_delete_with_active_assignees_rejected(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    # Insert custom role and assign staff member to it in real DB
    async with pool.acquire() as conn:
        role_id = await conn.fetchval(
            "INSERT INTO public.roles (business_id, name, is_preset) VALUES ($1, 'Cashier', false) RETURNING id",
            tenant["business_id"]
        )
        await conn.execute("UPDATE public.people SET role_id = $1 WHERE id = $2", role_id, tenant["staff_id"])

    owner_user = VerifiedUser(
        user_id="usr-owner-1",
        email="ramesh@apex.com",
        person_id=tenant["owner1_id"],
        business_id=tenant["business_id"],
        role_id=tenant["owner_role_id"],
        role_name="Owner",
        capabilities={"canManageRoles"}
    )
    app.dependency_overrides[verify_jwt_token] = lambda: owner_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.delete(f"/api/roles/{role_id}")
            assert res.status_code == 400
            assert "while 1 team member(s) are assigned to it" in res.json()["detail"]

            # Confirm role was NOT deleted from DB
            async with pool.acquire() as conn:
                count = await conn.fetchval("SELECT COUNT(*) FROM public.roles WHERE id = $1", role_id)
                assert count == 1
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_custom_role_delete_with_zero_assignees_succeeds(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    # Insert custom role with 0 assignees in real DB
    async with pool.acquire() as conn:
        role_id = await conn.fetchval(
            "INSERT INTO public.roles (business_id, name, is_preset) VALUES ($1, 'Temporary Lead', false) RETURNING id",
            tenant["business_id"]
        )

    owner_user = VerifiedUser(
        user_id="usr-owner-1",
        email="ramesh@apex.com",
        person_id=tenant["owner1_id"],
        business_id=tenant["business_id"],
        role_id=tenant["owner_role_id"],
        role_name="Owner",
        capabilities={"canManageRoles"}
    )
    app.dependency_overrides[verify_jwt_token] = lambda: owner_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.delete(f"/api/roles/{role_id}")
            assert res.status_code == 200
            assert res.json()["deleted_role_id"] == str(role_id)

            # Confirm deletion from real DB
            async with pool.acquire() as conn:
                count = await conn.fetchval("SELECT COUNT(*) FROM public.roles WHERE id = $1", role_id)
                assert count == 0
    finally:
        app.dependency_overrides.clear()

# ─── 6. Invite Acceptance Identity Mismatch Tests ─────────────────────────────

@pytest.mark.asyncio
async def test_invite_acceptance_identity_mismatch_rejected(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    # Insert pending invite for priya@apex.com
    async with pool.acquire() as conn:
        invite_id = await conn.fetchval(
            """
            INSERT INTO public.people (business_id, full_name, email_or_phone, role_id, status)
            VALUES ($1, 'Priya Candidate', 'priya@apex.com', $2, 'invited')
            RETURNING id
            """,
            tenant["business_id"], tenant["staff_role_id"]
        )

    # Authenticated user is impostor@other.com
    impostor_user = VerifiedUser(
        user_id="usr-impostor-999",
        email="impostor@other.com",
        person_id=None,
        business_id=None,
        role_id=None,
        role_name="Guest",
        capabilities=set()
    )
    app.dependency_overrides[verify_jwt_token] = lambda: impostor_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(f"/api/invites/{invite_id}/accept")
            assert res.status_code == 403
            assert "priya@apex.com" in res.json()["detail"]
            assert "impostor@other.com" in res.json()["detail"]

            # Confirm person is STILL invited (not active) in real DB
            async with pool.acquire() as conn:
                status = await conn.fetchval("SELECT status FROM public.people WHERE id = $1", invite_id)
                assert status == "invited"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_invite_acceptance_identity_match_succeeds(setup_test_database):
    pool = setup_test_database
    tenant = await seed_test_tenant(pool)

    # Insert pending invite for priya@apex.com and create corresponding auth.users account
    user_uuid = "00000000-0000-0000-0000-000000000123"
    async with pool.acquire() as conn:
        await conn.execute("INSERT INTO auth.users (id, email) VALUES ($1, 'priya@apex.com') ON CONFLICT DO NOTHING", user_uuid)
        invite_id = await conn.fetchval(
            """
            INSERT INTO public.people (business_id, full_name, email_or_phone, role_id, status)
            VALUES ($1, 'Priya Candidate', 'priya@apex.com', $2, 'invited')
            RETURNING id
            """,
            tenant["business_id"], tenant["staff_role_id"]
        )

    # Authenticated user matches priya@apex.com
    priya_user = VerifiedUser(
        user_id=user_uuid,
        email="priya@apex.com",
        person_id=None,
        business_id=None,
        role_id=None,
        role_name="Guest",
        capabilities=set()
    )
    app.dependency_overrides[verify_jwt_token] = lambda: priya_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(f"/api/invites/{invite_id}/accept")
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["status"] == "active"

            # Confirm real DB updated to active and user_id linked!
            async with pool.acquire() as conn:
                person = await conn.fetchrow("SELECT user_id, status FROM public.people WHERE id = $1", invite_id)
                assert person["status"] == "active"
                assert str(person["user_id"]) == "00000000-0000-0000-0000-000000000123"

                # Confirm activity event logged
                event_count = await conn.fetchval(
                    "SELECT COUNT(*) FROM public.activity_events WHERE business_id = $1 AND event_type = 'person_joined'",
                    tenant["business_id"]
                )
                assert event_count == 1
    finally:
        app.dependency_overrides.clear()
