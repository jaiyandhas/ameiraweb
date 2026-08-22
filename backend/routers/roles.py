import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from backend.auth import VerifiedUser, require_capability
from backend.database import get_pool, get_http_client
from backend.config import settings

logger = logging.getLogger("ameira.routers.roles")

router = APIRouter(prefix="/api/roles", tags=["Access Level Enforcement"])

class CreateRoleRequest(BaseModel):
    name: str
    description: str = ""
    capabilities: List[str] = []

class UpdateRoleRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capabilities: Optional[List[str]] = None

@router.post("")
async def create_access_level(
    body: CreateRoleRequest,
    current_user: VerifiedUser = Depends(require_capability("canManageRoles"))
):
    business_id = current_user.business_id
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Access level title cannot be empty.")

    pool = get_pool()
    now_iso = datetime.now(timezone.utc)

    if pool:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # 1. Insert role
                new_role = await conn.fetchrow(
                    """
                    INSERT INTO public.roles (business_id, name, description, is_preset, created_at, updated_at)
                    VALUES ($1, $2, $3, false, $4, $4)
                    RETURNING id, name, description, is_preset
                    """,
                    business_id, body.name.strip(), body.description.strip(), now_iso
                )
                role_id = str(new_role["id"])

                # 2. Insert capabilities
                if body.capabilities:
                    cap_rows = await conn.fetch(
                        "SELECT id, key FROM public.capabilities WHERE key = ANY($1::text[])",
                        body.capabilities
                    )
                    for c_row in cap_rows:
                        await conn.execute(
                            "INSERT INTO public.role_capabilities (role_id, capability_id) VALUES ($1, $2)",
                            role_id, c_row["id"]
                        )

                # 3. Insert Activity Event
                act_title = f'"{body.name.strip()}" access level was created.'
                await conn.execute(
                    """
                    INSERT INTO public.activity_events (business_id, event_type, title, created_at)
                    VALUES ($1, 'role_created', $2, $3)
                    """,
                    business_id, act_title, now_iso
                )

                return {
                    "success": True,
                    "id": role_id,
                    "name": new_role["name"],
                    "description": new_role["description"],
                    "capabilities": body.capabilities,
                    "message": act_title
                }
    else:
        http_client = get_http_client()
        svc_headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or "anon",
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

        # 1. Insert role
        now_str = now_iso.isoformat()
        r_resp = await http_client.post(
            f"{settings.SUPABASE_URL}/rest/v1/roles",
            json={
                "business_id": business_id,
                "name": body.name.strip(),
                "description": body.description.strip(),
                "is_preset": False,
                "created_at": now_str,
                "updated_at": now_str
            },
            headers=svc_headers
        )
        if r_resp.status_code not in (200, 201):
            raise HTTPException(status_code=500, detail="Failed to create role in database.")
        
        created_role = r_resp.json()[0]
        role_id = created_role.get("id")

        # 2. Insert capabilities
        if body.capabilities:
            cap_keys = ",".join(f'"{k}"' for k in body.capabilities)
            c_resp = await http_client.get(
                f"{settings.SUPABASE_URL}/rest/v1/capabilities?key=in.({cap_keys})&select=id,key",
                headers=svc_headers
            )
            if c_resp.status_code == 200:
                rc_payload = [
                    {"role_id": role_id, "capability_id": c["id"]}
                    for c in c_resp.json()
                ]
                if rc_payload:
                    await http_client.post(
                        f"{settings.SUPABASE_URL}/rest/v1/role_capabilities",
                        json=rc_payload,
                        headers=svc_headers
                    )

        # 3. Log activity
        act_title = f'"{body.name.strip()}" access level was created.'
        await http_client.post(
            f"{settings.SUPABASE_URL}/rest/v1/activity_events",
            json={
                "business_id": business_id,
                "event_type": "role_created",
                "title": act_title,
                "created_at": now_str
            },
            headers=svc_headers
        )

        return {
            "success": True,
            "id": role_id,
            "name": created_role["name"],
            "description": created_role["description"],
            "capabilities": body.capabilities,
            "message": act_title
        }

@router.patch("/{role_id}")
async def update_access_level(
    role_id: str,
    body: UpdateRoleRequest,
    current_user: VerifiedUser = Depends(require_capability("canManageRoles"))
):
    business_id = current_user.business_id
    pool = get_pool()
    now_iso = datetime.now(timezone.utc)

    if pool:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # 1. Fetch role and verify
                role = await conn.fetchrow(
                    "SELECT id, name, is_preset, business_id FROM public.roles WHERE id = $1",
                    role_id
                )
                if not role:
                    raise HTTPException(status_code=404, detail="Access level not found.")

                if role["business_id"] is not None and str(role["business_id"]) != business_id:
                    raise HTTPException(status_code=403, detail="Access level does not belong to this business.")

                # 2. Preset / Owner Guard
                if role["is_preset"] or role["name"] == "Owner":
                    raise HTTPException(
                        status_code=400,
                        detail="System standard access levels cannot be modified."
                    )

                # 3. Update role fields
                new_name = body.name.strip() if body.name is not None else role["name"]
                new_desc = body.description.strip() if body.description is not None else ""

                await conn.execute(
                    "UPDATE public.roles SET name = $1, description = $2, updated_at = $3 WHERE id = $4",
                    new_name, new_desc, now_iso, role_id
                )

                # 4. Update capabilities if provided
                if body.capabilities is not None:
                    await conn.execute("DELETE FROM public.role_capabilities WHERE role_id = $1", role_id)
                    if body.capabilities:
                        cap_rows = await conn.fetch(
                            "SELECT id, key FROM public.capabilities WHERE key = ANY($1::text[])",
                            body.capabilities
                        )
                        for c_row in cap_rows:
                            await conn.execute(
                                "INSERT INTO public.role_capabilities (role_id, capability_id) VALUES ($1, $2)",
                                role_id, c_row["id"]
                            )

                act_title = f'"{new_name}" access level was updated.'
                await conn.execute(
                    """
                    INSERT INTO public.activity_events (business_id, event_type, title, created_at)
                    VALUES ($1, 'generic', $2, $3)
                    """,
                    business_id, act_title, now_iso
                )

                return {"success": True, "id": role_id, "name": new_name, "message": act_title}
    else:
        http_client = get_http_client()
        svc_headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or "anon",
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }

        # 1. Fetch role
        r_resp = await http_client.get(
            f"{settings.SUPABASE_URL}/rest/v1/roles?id=eq.{role_id}&select=id,name,is_preset,business_id",
            headers=svc_headers
        )
        if r_resp.status_code != 200 or len(r_resp.json()) == 0:
            raise HTTPException(status_code=404, detail="Access level not found.")

        role = r_resp.json()[0]
        if role.get("business_id") is not None and str(role.get("business_id")) != business_id:
            raise HTTPException(status_code=403, detail="Access level does not belong to this business.")

        if role.get("is_preset") or role.get("name") == "Owner":
            raise HTTPException(status_code=400, detail="System standard access levels cannot be modified.")

        # 2. Update role
        now_str = now_iso.isoformat()
        update_data = {"updated_at": now_str}
        if body.name is not None:
            update_data["name"] = body.name.strip()
        if body.description is not None:
            update_data["description"] = body.description.strip()

        await http_client.patch(
            f"{settings.SUPABASE_URL}/rest/v1/roles?id=eq.{role_id}",
            json=update_data,
            headers=svc_headers
        )

        # 3. Update capabilities
        if body.capabilities is not None:
            await http_client.delete(
                f"{settings.SUPABASE_URL}/rest/v1/role_capabilities?role_id=eq.{role_id}",
                headers=svc_headers
            )
            if body.capabilities:
                cap_keys = ",".join(f'"{k}"' for k in body.capabilities)
                c_resp = await http_client.get(
                    f"{settings.SUPABASE_URL}/rest/v1/capabilities?key=in.({cap_keys})&select=id,key",
                    headers=svc_headers
                )
                if c_resp.status_code == 200:
                    rc_payload = [
                        {"role_id": role_id, "capability_id": c["id"]}
                        for c in c_resp.json()
                    ]
                    if rc_payload:
                        await http_client.post(
                            f"{settings.SUPABASE_URL}/rest/v1/role_capabilities",
                            json=rc_payload,
                            headers=svc_headers
                        )

        name_display = body.name or role.get("name", "Access Level")
        act_title = f'"{name_display}" access level was updated.'
        await http_client.post(
            f"{settings.SUPABASE_URL}/rest/v1/activity_events",
            json={
                "business_id": business_id,
                "event_type": "generic",
                "title": act_title,
                "created_at": now_str
            },
            headers=svc_headers
        )

        return {"success": True, "id": role_id, "name": name_display, "message": act_title}

@router.delete("/{role_id}")
async def delete_access_level(
    role_id: str,
    current_user: VerifiedUser = Depends(require_capability("canManageRoles"))
):
    business_id = current_user.business_id
    pool = get_pool()
    now_iso = datetime.now(timezone.utc)

    if pool:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # 1. Fetch role
                role = await conn.fetchrow(
                    "SELECT id, name, is_preset, business_id FROM public.roles WHERE id = $1",
                    role_id
                )
                if not role:
                    raise HTTPException(status_code=404, detail="Access level not found.")

                if role["business_id"] is not None and str(role["business_id"]) != business_id:
                    raise HTTPException(status_code=403, detail="Access level does not belong to this business.")

                # 2. Preset Guard
                if role["is_preset"] or role["name"] == "Owner":
                    raise HTTPException(
                        status_code=400,
                        detail="System standard access levels cannot be deleted."
                    )

                # 3. Assigned Members Guard
                assigned_count = await conn.fetchval(
                    "SELECT COUNT(*) FROM public.people WHERE role_id = $1",
                    role_id
                )
                if assigned_count > 0:
                    raise HTTPException(
                        status_code=400,
                        detail=f'Cannot delete "{role["name"]}" while {assigned_count} team member(s) are assigned to it. Reassign them first.'
                    )

                # 4. Delete capabilities and role
                await conn.execute("DELETE FROM public.role_capabilities WHERE role_id = $1", role_id)
                await conn.execute("DELETE FROM public.roles WHERE id = $1", role_id)

                act_title = f'"{role["name"]}" access level was deleted.'
                await conn.execute(
                    """
                    INSERT INTO public.activity_events (business_id, event_type, title, created_at)
                    VALUES ($1, 'generic', $2, $3)
                    """,
                    business_id, act_title, now_iso
                )

                return {"success": True, "deleted_role_id": role_id, "message": act_title}
    else:
        http_client = get_http_client()
        svc_headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or "anon",
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }

        # 1. Fetch role
        r_resp = await http_client.get(
            f"{settings.SUPABASE_URL}/rest/v1/roles?id=eq.{role_id}&select=id,name,is_preset,business_id",
            headers=svc_headers
        )
        if r_resp.status_code != 200 or len(r_resp.json()) == 0:
            raise HTTPException(status_code=404, detail="Access level not found.")

        role = r_resp.json()[0]
        if role.get("business_id") is not None and str(role.get("business_id")) != business_id:
            raise HTTPException(status_code=403, detail="Access level does not belong to this business.")

        if role.get("is_preset") or role.get("name") == "Owner":
            raise HTTPException(status_code=400, detail="System standard access levels cannot be deleted.")

        # 2. Check assigned members
        p_resp = await http_client.get(
            f"{settings.SUPABASE_URL}/rest/v1/people?role_id=eq.{role_id}&select=id",
            headers=svc_headers
        )
        assigned_count = len(p_resp.json()) if p_resp.status_code == 200 else 0
        if assigned_count > 0:
            raise HTTPException(
                status_code=400,
                detail=f'Cannot delete "{role.get("name")}" while {assigned_count} team member(s) are assigned to it. Reassign them first.'
            )

        # 3. Delete role
        await http_client.delete(
            f"{settings.SUPABASE_URL}/rest/v1/role_capabilities?role_id=eq.{role_id}",
            headers=svc_headers
        )
        await http_client.delete(
            f"{settings.SUPABASE_URL}/rest/v1/roles?id=eq.{role_id}",
            headers=svc_headers
        )

        now_str = now_iso.isoformat()
        act_title = f'"{role.get("name")}" access level was deleted.'
        await http_client.post(
            f"{settings.SUPABASE_URL}/rest/v1/activity_events",
            json={
                "business_id": business_id,
                "event_type": "generic",
                "title": act_title,
                "created_at": now_str
            },
            headers=svc_headers
        )

        return {"success": True, "deleted_role_id": role_id, "message": act_title}
