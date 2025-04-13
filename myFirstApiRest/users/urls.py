from django.urls import path
from .views import UserRegisterView, UserListView, UserRetrieveUpdateDestroyView, LogoutView, UserProfileView, ChangePasswordView
from .views import PerfilView, MisSubastasView, MisPujasView


app_name = "users"

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
    path('log-out/', LogoutView.as_view(), name='log-out'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path("misSubastas/", MisSubastasView.as_view(), name="misSubastas"),
    path("misPujas/", MisPujasView.as_view(), name="misPujas"),
    path("me/", UserProfileView.as_view(), name="user-profile"),

]
