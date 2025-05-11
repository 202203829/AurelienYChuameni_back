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
    RatingViewSet,
    average_rating_global,
    my_ratings
)

app_name = "auctions"

router = DefaultRouter()
router.register(r"bids", BidViewSet, basename="bids")
router.register(r"ratings", RatingViewSet, basename="ratings")
from .views import CommentViewSet

router.register(r"comments", CommentViewSet, basename="comments")


urlpatterns = [
    # ✅ Este endpoint debe ir ANTES que el router para que no lo pise
    path("ratings/global-average/", average_rating_global, name="global-average-rating"),

    # Resto de endpoints
    path("categories/", CategoryListCreate.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryRetrieveUpdateDestroy.as_view(), name="category-detail"),
    path("", AuctionListCreate.as_view(), name="auction-list-create"),
    path("<int:pk>/", AuctionRetrieveUpdateDestroy.as_view(), name="auction-detail"),
    path("users/", UserAuctionListView.as_view(), name="action-from-users"),
    path("users/misSubastas/", MyAuctionsView.as_view(), name="my-auctions"),
    path("bids/auction/<int:auction_id>/", bids_by_auction, name="bids-by-auction"),
    path("mybids/", MyBidsView.as_view(), name="my-bids"),
    path('ratings/mine/', my_ratings),
    # Este debe ir abajo
    path("", include(router.urls)),
]
