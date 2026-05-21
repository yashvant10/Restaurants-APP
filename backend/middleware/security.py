import time
import re
import json

class SecurityMiddleware:
    def __init__(self, app, rate_limit_requests: int = 120, rate_limit_period: int = 60):
        self.app = app
        self.rate_limit_requests = rate_limit_requests
        self.rate_limit_period = rate_limit_period
        self.request_records = {}  # ip: list of timestamps
        self.xss_pattern = re.compile(
            r"<script.*?>.*?</script>|javascript:|onerror=|onload=|onmouseover=|onfocus=|alert\(|eval\(", 
            re.IGNORECASE
        )

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # 1. API Rate Limiting
        client = scope.get("client")
        client_ip = client[0] if client else "unknown"
        now = time.time()
        
        if client_ip not in self.request_records:
            self.request_records[client_ip] = []
            
        self.request_records[client_ip] = [
            t for t in self.request_records[client_ip] 
            if now - t < self.rate_limit_period
        ]
        
        path = scope.get("path", "")
        if path.startswith("/api") and not path.startswith("/ws"):
            if len(self.request_records[client_ip]) >= self.rate_limit_requests:
                await self._send_json_response(
                    send, 
                    {"detail": "Rate limit exceeded. Please slow down your requests."}, 
                    status_code=429
                )
                return
            
            self.request_records[client_ip].append(now)

        # 2. XSS Input Sanitization / Security Inspection
        method = scope.get("method", "")
        headers = dict(scope.get("headers", []))
        
        # In ASGI, headers are keys and values in bytes
        content_type = ""
        for k, v in headers.items():
            if k.lower() == b"content-type":
                content_type = v.decode("utf-8", errors="ignore")
                break
        
        if method in ["POST", "PUT", "PATCH"] and "application/json" in content_type:
            # We need to read the body from the receive channel
            body_chunks = []
            more_body = True
            
            while more_body:
                message = await receive()
                assert message["type"] == "http.request"
                body_chunks.append(message.get("body", b""))
                more_body = message.get("more_body", False)
                
            body_bytes = b"".join(body_chunks)
            
            # Inspect body
            if body_bytes:
                try:
                    body_str = body_bytes.decode("utf-8", errors="ignore")
                    if self.xss_pattern.search(body_str):
                        await self._send_json_response(
                            send,
                            {"detail": "Security violation detected. Malicious HTML or XSS tags are forbidden."},
                            status_code=400
                        )
                        return
                except Exception:
                    pass
            
            # Reconstruct the receive channel to deliver the pre-read body to downstream app
            async def receive_with_body():
                return {"type": "http.request", "body": body_bytes, "more_body": False}
                
            receive = receive_with_body

        # Helper to intercept send so we can inject security headers
        async def send_with_headers(message):
            if message["type"] == "http.response.start":
                headers_list = list(message.get("headers", []))
                
                # Check and add security headers
                sec_headers = {
                    b"x-frame-options": b"DENY",
                    b"x-content-type-options": b"nosniff",
                    b"x-xss-protection": b"1; mode=block",
                    b"content-security-policy": b"default-src 'self' http: https: data: blob: 'unsafe-inline'",
                    b"referrer-policy": b"strict-origin-when-cross-origin"
                }
                
                # Filter out duplicate headers (case-insensitive)
                existing_keys = {h[0].lower() for h in headers_list}
                for k, v in sec_headers.items():
                    if k not in existing_keys:
                        headers_list.append((k, v))
                        
                message["headers"] = headers_list
                
            await send(message)

        try:
            await self.app(scope, receive, send_with_headers)
        except Exception as e:
            import logging
            logging.getLogger("backend").error(f"Global Request Error: {e}")
            await self._send_json_response(
                send,
                {"detail": f"An internal server error occurred: {str(e)}"},
                status_code=500
            )

    async def _send_json_response(self, send, data: dict, status_code: int):
        content = json.dumps(data).encode("utf-8")
        await send({
            "type": "http.response.start",
            "status": status_code,
            "headers": [
                (b"content-type", b"application/json"),
                (b"content-length", str(len(content)).encode("utf-8")),
            ]
        })
        await send({
            "type": "http.response.body",
            "body": content,
            "more_body": False
        })
