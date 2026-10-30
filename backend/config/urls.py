from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from django.http import JsonResponse, HttpResponse

def root_view(request):
    if 'text/html' in request.META.get('HTTP_ACCEPT', ''):
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ANDHRA AQUA RATES - API Server</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px; max-width: 540px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .badge { display: inline-block; background: #0284c7; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
        h1 { margin: 0 0 10px 0; font-size: 24px; color: #38bdf8; }
        p { color: #94a3b8; font-size: 15px; line-height: 1.5; margin: 0 0 24px 0; }
        .links { display: flex; flex-direction: column; gap: 12px; }
        .btn { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .btn-primary { background: #0284c7; color: #ffffff; }
        .btn-primary:hover { background: #0369a1; }
        .btn-secondary { background: #334155; color: #f1f5f9; }
        .btn-secondary:hover { background: #475569; }
        .status { margin-top: 24px; padding-top: 18px; border-top: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #64748b; }
        .dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; margin-right: 6px; box-shadow: 0 0 8px #22c55e; }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">API Backend Online</span>
        <h1>ANDHRA AQUA RATES</h1>
        <p>The Django REST Framework backend is running properly. To view the website application, click the frontend app link below:</p>
        <div class="links">
            <a href="http://localhost:5173" class="btn btn-primary">
                <span>Open Frontend Web App</span>
                <span>http://localhost:5173 &rarr;</span>
            </a>
            <a href="/api/docs/" class="btn btn-secondary">
                <span>Swagger Interactive API Docs</span>
                <span>/api/docs/ &rarr;</span>
            </a>
            <a href="/admin/" class="btn btn-secondary">
                <span>Django Admin Portal</span>
                <span>/admin/ &rarr;</span>
            </a>
            <a href="/api/v1/health/" class="btn btn-secondary">
                <span>API Health Check JSON</span>
                <span>/api/v1/health/ &rarr;</span>
            </a>
        </div>
        <div class="status">
            <span><span class="dot"></span> Backend operational on port 8000</span>
            <span>v1.0.0</span>
        </div>
    </div>
</body>
</html>"""
        return HttpResponse(html_content)
    return JsonResponse({
        'service': 'ANDHRA AQUA RATES API',
        'status': 'ok',
        'version': '1.0.0',
        'frontend_url': 'http://localhost:5173',
        'docs_url': '/api/docs/',
        'admin_url': '/admin/',
    })

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'ANDHRA AQUA RATES API',
        'version': '1.0.0',
    })

urlpatterns = [
    path('', root_view, name='root-view'),
    path('admin/', admin.site.urls),
    
    # OpenAPI Schema & Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Health check
    path('api/v1/health/', health_check, name='health-check'),
    
    # App URL dispatchers
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/locations/', include('apps.locations.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/buyers/', include('apps.buyers.urls')),
    path('api/v1/subscriptions/', include('apps.subscriptions.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/prices/', include('apps.pricing.urls')),
    path('api/v1/admin/', include('apps.audit.urls')),
]

from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Standalone media serving fallback for container/server setups
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
