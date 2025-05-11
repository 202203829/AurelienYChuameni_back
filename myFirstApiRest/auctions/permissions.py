from rest_framework.permissions import BasePermission, SAFE_METHODS


from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrAdminBid(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.bidder == request.user or request.user.is_staff

class IsOwnerOrAdmin(BasePermission):
    """
    Permite al propietario de la subasta o a un admin modificarla o eliminarla.
    Lectura abierta (GET, HEAD, OPTIONS).
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.auctioneer == request.user or request.user.is_staff
from rest_framework.permissions import BasePermission, SAFE_METHODS

from rest_framework import permissions

from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Permite ver siempre
        if request.method in permissions.SAFE_METHODS:
            return True
        # Solo permite modificar si es el propietario
        return obj.user == request.user

