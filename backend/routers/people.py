import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from backend.auth import VerifiedUser, require_capability
from backend.database import get_pool, get_http_client
from backend.config import settings

logger = logging.getLogger("ameira.routers.people")

router = APIRouter(prefix="/api/people", tags=["People Enforcement"])

class RoleChangeRequest(BaseModel):
    role_id: str

@router.post("/{person_id}/role")
async def update_person_role(
    person_id: str,
    body: RoleChangeRequest,
    current_user: VerifiedUser = Depends(require_capability("canManagePeople"))
):
    pool = get_pool()
    target_role_id = body.role_id
    business_id = current_user.business_id

    if pool:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # 1. Fetch target person and verify tenant isolation
                target = await conn.fetchrow(
                    "SELECT id, full_name, business_id, role_id, status FROM public.people WHERE id = $1",
                    person_id
                )
                if not target or str(target["business_id"]) != business_id:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Person not found in this business workspace."
                    )

                # 2. Fetch new role details
                new_role = await conn.fetchrow(
                    "SELECT id, name FROM public.roles WHERE id = $1 AND (business_id = $2 OR is_preset = true)",
                    target_role_id, business_id
                )
                if not new_role:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Selected access level is invalid for this business."
                    )

                # 3. Check target's current role
                current_role_name = ""
                if target["role_id"]:
                    c_role = await conn.fetchrow("SELECT name FROM public.roles WHERE id = $1", target["role_id"])
                    if c_role:
                        current_role_name = c_role["name"]

                # 4. Sole-Owner Demotion Guard
                if current_role_name == "Owner" and new_role["name"] != "Owner":
                    owner_count = await conn.fetchval(
                        """
                        SELECT COUNT(*) FROM public.people p
                        JOIN public.roles r ON p.role_id = r.id
                        WHERE p.business_id = $1 AND r.name = 'Owner' AND p.status = 'active'
                        """,
                        business_id
                    )
                    if owner_count <= 1:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Cannot change the access level of the sole active Owner of the workspace. Designate another Owner first."
                        )

                # 5. Apply role update
                now_iso = datetime.now(timezone.utc)
                await conn.execute(
                    "UPDATE public.people SET role_id = $1, updated_at = $2 WHERE id = $3",
                    target_role_id, now_iso, person_id
                )

                # 6. Write Activity Event
                activity_title = f"{target['full_name']}'s access level was changed to {new_role['name']}."
                await conn.execute(
                    """
                    INSERT INTO public.activity_events (business_id, event_type, title, created_at)
                    VALUES ($1, 'role_assigned', $2, $3)
                    """,
                    business_id, activity_title, now_iso
                )

                return {
                    "success": True,
                    "person_id": person_id,
                    "role_id": target_role_id,
                    "role_name": new_role["name"],
                    "message": activity_title
                }
    else:
        # High-speed HTTP fallback
        http_client = get_http_client()
        svc_headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or "anon",
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

        # 1. Fetch target person
        p_resp = await http_client.get(
            f"{settings.SUPABASE_URL}/rest/v1/people?id=eq.{person_id}&select=id,full_name,business_id,role_id,status",
            headers=svc_headers
        )
        if p_resp.status_code != 200 or len(p_resp.json()) == 0:
            raise HTTPException(status_code=404, detail="Person not found.")
        
        target = p_resp.json()[0]
        if str(target.get("business_id")) != business_id:
            raise HTTPException(status_code=403, detail="Person does not belong to this business.")

        # 2. Fetch new role
        r_resp = await http_client.get(
            f"{settings.SUPABASE_URL}/rest/v1/roles?id=eq.{target_role_id}&select=id,name",
            headers=svc_headers
        )
        if r_resp.status_code != 200 or len(r_resp.json()) == 0:
            raise HTTPException(status_code=400, detail="Invalid target role.")
        new_role = r_resp.json()[0]

        # 3. Check current role
        cur_role_name = ""
        if target.get("role_id"):
            cr_resp = await http_client.get(
                f"{settings.SUPABASE_URL}/rest/v1/roles?id=eq.{target['role_id']}&select=name",
                headers=svc_headers
            )
            if cr_resp.status_code == 200 and len(cr_resp.json()) > 0:
                cur_role_name = cr_resp.json()[0].get("name", "")

        # 4. Sole Owner check
        if cur_role_name == "Owner" and new_role.get("name") != "Owner":
            all_p_resp = await http_client.get(
                f"{settings.SUPABASE_URL}/rest/v1/people?business_id=eq.{business_id}&status=eq.active&select=role_id,roles(name)",
                headers=svc_headers
            )
            if all_p_resp.status_code == 200:
                owners = [p for p in all_p_resp.json() if p.get("roles", {}).get("name") == "Owner"]
                if len(owners) <= 1:
                    raise HTTPException(
                        status_code=400,
                        detail="Cannot change the access level of the sole active Owner of the workspace. Designate another Owner first."
                    )

        # 5. Update person
        now_str = datetime.now(timezone.utc).isoformat()
        u_resp = await http_client.patch(
            f"{settings.SUPABASE_URL}/rest/v1/people?id=eq.{person_id}",
            json={"role_id": target_role_id, "updated_at": now_str},
            headers=svc_headers
        )
        if u_resp.status_code not in (200, 204):
            raise HTTPException(status_code=500, detail="Failed to update person role in database.")

        # 6. Insert activity event
        act_title = f"{target['full_name']}'s access level was changed to {new_role['name']}."
        await http_client.post(
            f"{settings.SUPABASE_URL}/rest/v1/activity_events",
            json={
                "business_id": business_id,
                "event_type": "role_assigned",
                "title": act_title,
                "created_at": now_str
            },
            headers=svc_headers
        )

        return {
            "success": True,
            "person_id": person_id,
            "role_id": target_role_id,
            "role_name": new_role["name"],
            "message": act_title
        }

@router.post("/{person_id}/remove")
async def remove_person(
    person_id: str,
    current_user: VerifiedUser = Depends(require_capability("canManagePeople"))
):
    pool = get_pool()
    business_id = current_user.business_id

    if pool:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # 1. Fetch person
                target = await conn.fetchrow(
                    "SELECT id, full_name, business_id, role_id, status FROM public.people WHERE id = $1",
                    person_id
                )
                if not target or str(target["business_id"]) != business_id:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Person not found in this business workspace."
                    )

                # 2. Check if target is an Owner
                is_owner = False
                if target["role_id"]:
                    r_name = await conn.fetchval("SELECT name FROM public.roles WHERE id = $1", target["role_id"])
                    if r_name == "Owner":
                        is_owner = True

                # 3. Sole Owner Removal Guard
                if is_owner and target["status"] == "active":
                    owner_count = await conn.fetchval(
                        """
                        SELECT COUNT(*) FROM public.people p
                        JOIN public.roles r ON p.role_id = r.id
                        WHERE p.business_id = $1 AND r.name = 'Owner' AND p.status = 'active'
                        """,
                        business_id
                    )
                    if owner_count <= 1:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Cannot remove the sole active Owner of the business workspace."
                        )

                # 4. Delete person
                await conn.execute("DELETE FROM public.people WHERE id = $1", person_id)

                # 5. Write activity event
                now_iso = datetime.now(timezone.utc)
                activity_title = f"{target['full_name']} was removed from the business."
                await conn.execute(
                    """
                    INSERT INTO public.activity_events (business_id, event_type, title, created_at)
                    VALUES ($1, 'generic', $2, $3)
                    """,
                    business_id, activity_title, now_iso
                )

                return {
                    "success": True,
                    "removed_person_id": person_id,
                    "message": activity_title
                }
    else:
        http_client = get_http_client()
        svc_headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or "anon",
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }

        # 1. Fetch person
        p_resp = await http_client.get(
            f"{settings.SUPABASE_URL}/rest/v1/people?id=eq.{person_id}&select=id,full_name,business_id,role_id,status,roles(name)",
            headers=svc_headers
        )
        if p_resp.status_code != 200 or len(p_resp.json()) == 0:
            raise HTTPException(status_code=404, detail="Person not found.")

        target = p_resp.json()[0]
        if str(target.get("business_id")) != business_id:
            raise HTTPException(status_code=403, detail="Person does not belong to this business.")

        # 2. Sole Owner check
        role_name = target.get("roles", {}).get("name", "") if target.get("roles") else ""
        if role_name == "Owner" and target.get("status") == "active":
            all_p_resp = await http_client.get(
                f"{settings.SUPABASE_URL}/rest/v1/people?business_id=eq.{business_id}&status=eq.active&select=roles(name)",
                headers=svc_headers
            )
            if all_p_resp.status_code == 200:
                owners = [p for p in all_p_resp.json() if p.get("roles", {}).get("name") == "Owner"]
                if len(owners) <= 1:
                    raise HTTPException(
                        status_code=400,
                        detail="Cannot remove the sole active Owner of the business workspace."
                    )

        # 3. Delete person
        await http_client.delete(
            f"{settings.SUPABASE_URL}/rest/v1/people?id=eq.{person_id}",
            headers=svc_headers
        )

        now_str = datetime.now(timezone.utc).isoformat()
        act_title = f"{target['full_name']} was removed from the business."
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

        return {
            "success": True,
            "removed_person_id": person_id,
            "message": act_title
        }
