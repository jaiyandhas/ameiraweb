import logging
from typing import Optional, Set
import jwt
from fastapi import Header, HTTPException, status, Depends
from pydantic import BaseModel
import httpx
from backend.config import settings
from backend.database import get_pool, get_http_client

logger = logging.getLogger("ameira.auth")

class VerifiedUser(BaseModel):
    user_id: str
    email: str
    person_id: Optional[str] = None
    business_id: Optional[str] = None
    role_id: Optional[str] = None
    role_name: Optional[str] = None
    capabilities: Set[str] = set()

    def has_capability(self, capability: str) -> bool:
        if self.role_name == "Owner":
            return True
        return capability in self.capabilities

async def verify_jwt_token(authorization: Optional[str] = Header(None)) -> VerifiedUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected 'Bearer <token>'."
        )

    token = authorization.split(" ")[1].strip()
    user_id: Optional[str] = None
    email: Optional[str] = None

    # 1. Attempt local JWT signature verification if secret is configured
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET, 
                algorithms=["HS256"], 
                options={"verify_aud": False}
            )
            user_id = payload.get("sub")
            email = payload.get("email", "")
        except jwt.PyJWTError as e:
            logger.warning(f"HMAC JWT verification failed: {e}")

    # 2. If user_id is not yet derived, verify with Supabase Auth endpoint
    if not user_id:
        http_client = get_http_client()
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_URL,
        }
        try:
            resp = await http_client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers=headers
            )
            if resp.status_code == 200:
                user_data = resp.json()
                user_id = user_data.get("id")
                email = user_data.get("email", "")
            else:
                logger.error(f"Supabase Auth verification rejected token (status {resp.status_code}): {resp.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired session token."
                )
        except HTTPException:
            raise
        except Exception as err:
            logger.error(f"Exception during Supabase Auth check: {err}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to verify authentication token."
            )

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User identity could not be verified."
        )

    # 3. Derive Person, Business ID, Role, and Capabilities server-side
    pool = get_pool()
    person_id: Optional[str] = None
    business_id: Optional[str] = None
    role_id: Optional[str] = None
    role_name: Optional[str] = None
    capabilities: Set[str] = set()

    if pool:
        async with pool.acquire() as conn:
            # Query person record
            person_row = await conn.fetchrow(
                "SELECT id, business_id, role_id FROM public.people WHERE user_id = $1 AND status = 'active' LIMIT 1",
                user_id
            )
            if person_row:
                person_id = str(person_row["id"])
                business_id = str(person_row["business_id"])
                role_id = str(person_row["role_id"]) if person_row["role_id"] else None

            # If not in people, fallback check businesses table for owner
            if not business_id:
                biz_row = await conn.fetchrow(
                    "SELECT id FROM public.businesses WHERE owner_id = $1 LIMIT 1",
                    user_id
                )
                if biz_row:
                    business_id = str(biz_row["id"])

            # Query role name & capabilities
            if role_id:
                role_row = await conn.fetchrow("SELECT name, is_preset FROM public.roles WHERE id = $1", role_id)
                if role_row:
                    role_name = role_row["name"]

                cap_rows = await conn.fetch(
                    """
                    SELECT c.key 
                    FROM public.role_capabilities rc
                    JOIN public.capabilities c ON rc.capability_id = c.id
                    WHERE rc.role_id = $1
                    """,
                    role_id
                )
                capabilities = {row["key"] for row in cap_rows}
    else:
        # High-speed HTTP query fallback using Supabase Service Key
        http_client = get_http_client()
        svc_headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or "anon",
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY or token}",
        }

        # Fetch Person
        p_resp = await http_client.get(
            f"{settings.SUPABASE_URL}/rest/v1/people?user_id=eq.{user_id}&status=eq.active&select=id,business_id,role_id",
            headers=svc_headers
        )
        if p_resp.status_code == 200 and len(p_resp.json()) > 0:
            p_data = p_resp.json()[0]
            person_id = p_data.get("id")
            business_id = p_data.get("business_id")
            role_id = p_data.get("role_id")

        if not business_id:
            b_resp = await http_client.get(
                f"{settings.SUPABASE_URL}/rest/v1/businesses?owner_id=eq.{user_id}&select=id",
                headers=svc_headers
            )
            if b_resp.status_code == 200 and len(b_resp.json()) > 0:
                business_id = b_resp.json()[0].get("id")

        if role_id:
            r_resp = await http_client.get(
                f"{settings.SUPABASE_URL}/rest/v1/roles?id=eq.{role_id}&select=name,is_preset",
                headers=svc_headers
            )
            if r_resp.status_code == 200 and len(r_resp.json()) > 0:
                role_name = r_resp.json()[0].get("name")

            # Fetch Capabilities
            rc_resp = await http_client.get(
                f"{settings.SUPABASE_URL}/rest/v1/role_capabilities?role_id=eq.{role_id}&select=capabilities(key)",
                headers=svc_headers
            )
            if rc_resp.status_code == 200:
                for item in rc_resp.json():
                    cap = item.get("capabilities")
                    if isinstance(cap, dict) and "key" in cap:
                        capabilities.add(cap["key"])

    if role_name == "Owner":
        capabilities.update({
            "canManagePeople",
            "canManageRoles",
            "canViewBusinessSettings",
            "canEditBusinessSettings"
        })

    return VerifiedUser(
        user_id=user_id,
        email=email or "",
        person_id=person_id,
        business_id=business_id,
        role_id=role_id,
        role_name=role_name or ("Owner" if not role_id else "Staff"),
        capabilities=capabilities
    )

def require_capability(capability_name: str):
    async def dependency(current_user: VerifiedUser = Depends(verify_jwt_token)) -> VerifiedUser:
        if not current_user.business_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have an active business workspace."
            )
        if not current_user.has_capability(capability_name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. This action requires '{capability_name}' permission."
            )
        return current_user
    return dependency
