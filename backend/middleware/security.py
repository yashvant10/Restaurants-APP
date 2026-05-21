import time
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import re
import json

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit_requests: int = 120, rate_limit_period: int = 60):
        super().__init__(app)
        self.rate_limit_requests = rate_limit_requests
        self.rate_limit_period = rate_limit_period
        self.request_records = {}  # ip: list of timestamps
        self.xss_pattern = re.compile(
            r"<script.*?>.*?</script>|javascript:|onerror=|onload=|onmouseover=|onfocus=|alert\(|eval\(", 
            re.IGNORECASE
        )

    async def dispatch(self, request: Request, call_next):
        # 1. API Rate Limiting
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Initialize records for IP
        if client_ip not in self.request_records:
            self.request_records[client_ip] = []
            
        # Clean old timestamps
        self.request_records[client_ip] = [
            t for t in self.request_records[client_ip] 
            if now - t < self.rate_limit_period
        ]
        
        # Rate limit checks (exclude websockets)
        if request.url.path.startswith("/api") and not request.url.path.startswith("/ws"):
            if len(self.request_records[client_ip]) >= self.rate_limit_requests:
                return Response(
                    content=json.dumps({"detail": "Rate limit exceeded. Please slow down your requests."}),
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    media_type="application/json"
                )
            
            # Record current request timestamp
            self.request_records[client_ip].append(now)

        # 2. XSS Input Sanitization / Security Inspection
        # Inspect only write methods with JSON content
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                body_bytes = await request.body()
                if body_bytes:
                    try:
                        body_str = body_bytes.decode("utf-8")
                        # Search for malicious XSS scripts
                        if self.xss_pattern.search(body_str):
                            return Response(
                                content=json.dumps({
                                    "detail": "Security violation detected. Malicious HTML or XSS tags are forbidden."
                                }),
                                status_code=status.HTTP_400_BAD_REQUEST,
                                media_type="application/json"
                            )
                        
                        # Re-inject body bytes so endpoints can consume it later
                        async def receive():
                            return {"type": "http.request", "body": body_bytes, "more_body": False}
                        request._receive = receive
                    except Exception:
                        pass

        # Proceed to next route handler
        try:
            response = await call_next(request)
            
            # Inject security headers (OWASP best practice)
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Content-Security-Policy"] = "default-src 'self' http: https: data: blob: 'unsafe-inline'"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            
            return response
        except Exception as e:
            import logging
            logging.getLogger("backend").error(f"Global Request Error: {e}")
            return Response(
                content=json.dumps({"detail": f"An internal server error occurred: {str(e)}"}),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                media_type="application/json"
            )
