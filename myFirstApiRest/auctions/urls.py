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
)

app_name = "auctions"

router = DefaultRouter()
router.register(r"bids", BidViewSet, basename="bids")  # <- para GET/POST de pujas

urlpatterns = [
    path("categories/", CategoryListCreate.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryRetrieveUpdateDestroy.as_view(), name="category-detail"),
    path("", AuctionListCreate.as_view(), name="auction-list-create"),
    path("<int:pk>/", AuctionRetrieveUpdateDestroy.as_view(), name="auction-detail"),
    path("users/", UserAuctionListView.as_view(), name="action-from-users"),
    path("", include(router.urls)),  # <- endpoints automáticos de /bids/
    path("bids/auction/<int:auction_id>/", bids_by_auction, name="bids-by-auction"),
    path("mybids/", MyBidsView.as_view(), name="my-bids"),  # 🔄 cambiado aquí
    path("users/misSubastas/", MyAuctionsView.as_view(), name="my-auctions"),
]
