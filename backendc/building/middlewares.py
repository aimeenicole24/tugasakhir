from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)

class DebugCSRFTokenMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        csrf_token = request.COOKIES.get('csrftoken', 'TIDAK ADA')
        logger.info(f"CSRF Token di Response: {csrf_token}")
        return response
