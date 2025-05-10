from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryListCreate,
    CategoryRetrieveUpdateDestroy,
    AuctionListCreate,
    AuctionRetrieveUpdateDestroy,
    UserAuctionListView,
    MyAuctionsView,
    BidViewSet,
    MyBidsView,
    bids_by_auction,
    RatingViewSet
)

app_name = "auctions"

router = DefaultRouter()
router.register(r"bids", BidViewSet, basename="bids")              # /api/bids/
router.register(r"ratings", RatingViewSet, basename="ratings")    # /api/ratings/

urlpatterns = [
    # Categorías
    path("categories/", CategoryListCreate.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryRetrieveUpdateDestroy.as_view(), name="category-detail"),

    # Subastas
    path("", AuctionListCreate.as_view(), name="auction-list-create"),
    path("<int:pk>/", AuctionRetrieveUpdateDestroy.as_view(), name="auction-detail"),

    # Subastas del usuario autenticado
    path("users/", UserAuctionListView.as_view(), name="action-from-users"),
    path("users/misSubastas/", MyAuctionsView.as_view(), name="my-auctions"),

    # Endpoints personalizados
    path("bids/auction/<int:auction_id>/", bids_by_auction, name="bids-by-auction"),
    path("mybids/", MyBidsView.as_view(), name="my-bids"),

    # Incluir rutas del router (bids y ratings)
    path("", include(router.urls)),
]
