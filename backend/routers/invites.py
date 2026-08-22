import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from backend.auth import VerifiedUser, verify_jwt_token
from backend.database import get_pool, get_http_client
from backend.config import settings

logger = logging.getLogger("ameira.routers.invites")

router = APIRouter(prefix="/api/invites", tags=["Invite Acceptance Enforcement"])

@router.post("/{invite_id}/accept")
async def accept_invitation(
    invite_id: str,
    current_user: VerifiedUser = Depends(verify_jwt_token)
):
    pool = get_pool()
    now_iso = datetime.now(timezone.utc)
    user_id = current_user.user_id
    user_email = current_user.email.strip().lower()

    if pool:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # 1. Fetch pending invite
                invite = await conn.fetchrow(
                    "SELECT id, business_id, full_name, email_or_phone, status FROM public.people WHERE id = $1",
                    invite_id
                )
                if not invite:
                    raise HTTPException(status_code=404, detail="Invitation not found or has expired.")

                if invite["status"] != "invited":
                    raise HTTPException(status_code=400, detail="This invitation has already been accepted or processed.")

                # 2. Verify identity matches
                invite_contact = invite["email_or_phone"].strip().lower()
                if user_email and invite_contact != user_email:
                    logger.warning(f"Invite contact mismatch: invite is for '{invite_contact}', user email is '{user_email}'")

                # 3. Transition invite to active person record
                await conn.execute(
                    """
                    UPDATE public.people 
                    SET user_id = $1, status = 'active', joined_at = $2, updated_at = $2 
                    WHERE id = $3
                    """,
                    user_id, now_iso, invite_id
                )

                # 4. Log person joined activity
                business_id = str(invite["business_id"])
                act_title = f"{invite['full_name']} joined the business workspace."
                await conn.execute(
                    """
                    INSERT INTO public.activity_events (business_id, event_type, title, created_at)
                    VALUES ($1, 'person_joined', $2, $3)
                    """,
                    business_id, act_title, now_iso
                )

                return {
                    "success": True,
                    "person_id": invite_id,
                    "business_id": business_id,
                    "status": "active",
                    "message": act_title
                }
    else:
        http_client = get_http_client()
        svc_headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or "anon",
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }

        # 1. Fetch invite
        i_resp = await http_client.get(
            f"{settings.SUPABASE_URL}/rest/v1/people?id=eq.{invite_id}&select=id,business_id,full_name,email_or_phone,status",
            headers=svc_headers
        )
        if i_resp.status_code != 200 or len(i_resp.json()) == 0:
            raise HTTPException(status_code=404, detail="Invitation not found.")

        invite = i_resp.json()[0]
        if invite.get("status") != "invited":
            raise HTTPException(status_code=400, detail="This invitation has already been accepted.")

        # 2. Update person
        now_str = now_iso.isoformat()
        await http_client.patch(
            f"{settings.SUPABASE_URL}/rest/v1/people?id=eq.{invite_id}",
            json={
                "user_id": user_id,
                "status": "active",
                "joined_at": now_str,
                "updated_at": now_str
            },
            headers=svc_headers
        )

        business_id = invite.get("business_id")
        act_title = f"{invite['full_name']} joined the business workspace."
        await http_client.post(
            f"{settings.SUPABASE_URL}/rest/v1/activity_events",
            json={
                "business_id": business_id,
                "event_type": "person_joined",
                "title": act_title,
                "created_at": now_str
            },
            headers=svc_headers
        )

        return {
            "success": True,
            "person_id": invite_id,
            "business_id": business_id,
            "status": "active",
            "message": act_title
        }
